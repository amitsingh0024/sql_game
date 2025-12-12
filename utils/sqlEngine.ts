import { MockTable } from '../types';

export interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  message?: string;
}

// Helper to normalize values for comparison
const normalize = (val: any) => {
  if (val === null || val === undefined || val === 'NULL') return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.replace(/['"]/g, '').trim();
    // Try to convert to number if possible for loose equality
    if (!isNaN(Number(s)) && s !== '') return Number(s);
    return s.toLowerCase();
  }
  return val;
};

// Helper: Get value from row (Exact, Fuzzy, or Aggregated Key)
const getRowValue = (row: any, key: string) => {
    // 1. Exact match (e.g. "SUM(sales)" or "t1.id")
    if (row.hasOwnProperty(key)) return row[key];
    
    // 2. Case-insensitive match
    const lowerKey = key.toLowerCase();
    const caseKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
    if (caseKey) return row[caseKey];

    // 3. Suffix match (e.g. asking for "id", finding "table.id" or "alias.id")
    const suffixKey = Object.keys(row).find(k => k.endsWith('.' + key) || k.toLowerCase().endsWith('.' + lowerKey));
    return suffixKey !== undefined ? row[suffixKey] : undefined;
};

// Evaluate a single condition
const evaluateCondition = (row: any, condition: string, tables: MockTable[]): boolean => {
  const c = condition.trim();

  // Handle IS NULL / IS NOT NULL
  const nullMatch = c.match(/^(.+?)\s+(IS NULL|IS NOT NULL)$/i);
  if (nullMatch) {
    const col = nullMatch[1].trim();
    const op = nullMatch[2].toUpperCase();
    let val = getRowValue(row, col);
    
    const isNull = (val === null || val === undefined || val === 'NULL');
    return op === 'IS NULL' ? isNull : !isNull;
  }

  // Handle IN (SELECT ...) - Subquery
  const subQueryMatch = c.match(/^(.+?)\s+IN\s*\((SELECT[\s\S]+)\)$/i);
  if (subQueryMatch) {
    const col = subQueryMatch[1].trim();
    const query = subQueryMatch[2].trim();
    
    const result = executeQuery(query, tables);
    
    if (!result.success || !result.data) return false;
    
    const val = getRowValue(row, col);
    const nVal = normalize(val);
    
    const allowedValues = result.data.map(r => {
        const keys = Object.keys(r);
        return keys.length > 0 ? normalize(r[keys[0]]) : null;
    });

    return allowedValues.includes(nVal);
  }

  // Handle LIKE operator
  const likeMatch = c.match(/^(.+?)\s+LIKE\s+(.+)$/i);
  if (likeMatch) {
    const col = likeMatch[1].trim();
    const pattern = likeMatch[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
    const val = getRowValue(row, col);
    
    if (typeof val !== 'string') return false;

    // Convert SQL LIKE pattern (%) to Regex (.*)
    const escapeRegex = (str: string) => str.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regexBody = '^' + escapeRegex(pattern).replace(/%/g, '.*') + '$';
    const regex = new RegExp(regexBody, 'i'); // Case insensitive LIKE
    
    return regex.test(val);
  }

  // Handle standard operators
  const operatorMatch = c.match(/^(.+?)\s*(=|<>|!=|>|<|>=|<=)\s*(.+)$/);
  if (!operatorMatch) return false;

  const leftStr = operatorMatch[1].trim();
  const op = operatorMatch[2].trim();
  const rightStr = operatorMatch[3].trim();
  
  // Resolve Values
  let leftVal = leftStr.match(/^['"].*['"]$/) || !isNaN(Number(leftStr)) ? leftStr : getRowValue(row, leftStr);
  let rightVal = rightStr.match(/^['"].*['"]$/) || !isNaN(Number(rightStr)) ? rightStr : getRowValue(row, rightStr);

  if (leftVal === undefined) leftVal = leftStr;
  if (rightVal === undefined) rightVal = rightStr;

  const unquote = (v: any) => {
      if (typeof v === 'string' && v.match(/^['"].*['"]$/)) return v.slice(1, -1);
      return v;
  }
  leftVal = unquote(leftVal);
  rightVal = unquote(rightVal);

  const nLeft = normalize(leftVal);
  const nRight = normalize(rightVal);

  switch (op) {
    case '=': return nLeft == nRight;
    case '<>': 
    case '!=': return nLeft != nRight;
    case '>': return nLeft > nRight;
    case '<': return nLeft < nRight;
    case '>=': return nLeft >= nRight;
    case '<=': return nLeft <= nRight;
    default: return false;
  }
};

// --- AGGREGATION HELPERS ---
const calculateAggregate = (func: string, column: string, rows: any[]): number => {
    const cleanCol = column.trim();
    if (func === 'COUNT') {
        if (cleanCol === '*' || cleanCol === '1') return rows.length;
        return rows.filter(r => {
            const val = getRowValue(r, cleanCol);
            return val !== null && val !== undefined && val !== 'NULL';
        }).length;
    }
    const values = rows.map(r => {
        const val = getRowValue(r, cleanCol);
        const num = Number(val);
        return isNaN(num) ? 0 : num;
    });
    if (values.length === 0) return 0;
    switch (func) {
        case 'SUM': return values.reduce((a, b) => a + b, 0);
        case 'AVG': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'MAX': return Math.max(...values);
        case 'MIN': return Math.min(...values);
        default: return 0;
    }
};

// --- WINDOW FUNCTION PROCESSOR ---
const processWindowFunctions = (data: any[], selectClause: string): any[] => {
    const windowFuncRegex = /([A-Z_]+\(.*?\))\s+OVER\s*\((.*?)\)/gi;
    let processedData = data.map(d => ({...d}));
    let match;

    while ((match = windowFuncRegex.exec(selectClause)) !== null) {
        const fullString = match[0]; 
        const funcPart = match[1]; 
        const overPart = match[2]; 
        
        const funcMatch = funcPart.match(/^([A-Z_]+)\((.*?)\)$/i);
        if (!funcMatch) continue;
        const funcName = funcMatch[1].toUpperCase();
        const funcArgs = funcMatch[2].trim();

        let partitionKey: string | null = null;
        let orderKey: string | null = null;
        let orderDesc = false;

        const partitionMatch = overPart.match(/PARTITION\s+BY\s+([a-z0-9_.]+)/i);
        if (partitionMatch) partitionKey = partitionMatch[1];

        const orderMatch = overPart.match(/ORDER\s+BY\s+([a-z0-9_.]+)(\s+(ASC|DESC))?/i);
        if (orderMatch) {
            orderKey = orderMatch[1];
            orderDesc = orderMatch[3]?.toUpperCase() === 'DESC';
        }

        const partitions: Record<string, any[]> = {};
        processedData.forEach((row, index) => {
            const key = partitionKey ? String(getRowValue(row, partitionKey)) : 'ALL';
            if (!partitions[key]) partitions[key] = [];
            partitions[key].push({ row, index }); 
        });

        Object.values(partitions).forEach(partitionItems => {
            if (orderKey) {
                partitionItems.sort((a, b) => {
                    let valA = getRowValue(a.row, orderKey!);
                    let valB = getRowValue(b.row, orderKey!);
                    if (valA < valB) return orderDesc ? 1 : -1;
                    if (valA > valB) return orderDesc ? -1 : 1;
                    return 0;
                });
            }

            let runningTotal = 0;
            let currentRank = 1;
            let denseRank = 1;
            
            partitionItems.forEach((item, i) => {
                const prevItem = i > 0 ? partitionItems[i-1] : null;
                const nextItem = i < partitionItems.length - 1 ? partitionItems[i+1] : null;
                
                let resultVal: any = null;
                const currentSortVal = orderKey ? getRowValue(item.row, orderKey) : null;
                const prevSortVal = prevItem && orderKey ? getRowValue(prevItem.row, orderKey) : null;

                if (i > 0 && currentSortVal !== prevSortVal) {
                    currentRank = i + 1;
                    denseRank++;
                }

                switch (funcName) {
                    case 'ROW_NUMBER': resultVal = i + 1; break;
                    case 'RANK': resultVal = currentRank; break;
                    case 'DENSE_RANK': resultVal = denseRank; break;
                    case 'LAG': resultVal = prevItem ? getRowValue(prevItem.row, funcArgs) : null; break;
                    case 'LEAD': resultVal = nextItem ? getRowValue(nextItem.row, funcArgs) : null; break;
                    case 'SUM':
                        const val = Number(getRowValue(item.row, funcArgs)) || 0;
                        if (orderKey) { runningTotal += val; resultVal = runningTotal; } 
                        else { resultVal = partitionItems.reduce((sum, it) => sum + (Number(getRowValue(it.row, funcArgs)) || 0), 0); }
                        break;
                    case 'COUNT':
                         if (orderKey) { resultVal = i + 1; } else { resultVal = partitionItems.length; }
                         break;
                    default: resultVal = null;
                }
                processedData[item.index][fullString] = resultVal;
            });
        });
    }
    return processedData;
};

// --- HELPER: PARSE TABLE AND ALIAS ---
const parseTableStr = (str: string) => {
    const parts = str.trim().split(/\s+(?:AS\s+)?/i);
    const name = parts[0];
    const alias = parts.length > 1 ? parts[1] : name;
    return { name, alias };
};

export const executeQuery = (query: string, tables: MockTable[]): QueryResult => {
  let q = query.replace(/[\r\n\t]+/g, ' ').trim();
  
  // CTE Handler
  if (q.toUpperCase().startsWith('WITH')) {
      const cteMatch = q.match(/^WITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(([\s\S]+?)\)\s*(SELECT[\s\S]+)$/i);
      if (cteMatch) {
          const cteName = cteMatch[1];
          const cteQuery = cteMatch[2];
          const mainQuery = cteMatch[3];
          const cteResult = executeQuery(cteQuery, tables);
          if (!cteResult.success) return { success: false, error: `CTE '${cteName}' ERROR: ${cteResult.error}` };
          const tempTable: MockTable = {
              name: cteName,
              columns: cteResult.data && cteResult.data.length > 0 ? Object.keys(cteResult.data[0]).map(k => ({ name: k, type: 'string' })) : [],
              data: cteResult.data || []
          };
          return executeQuery(mainQuery, [...tables, tempTable]);
      }
  }

  // UNION Handler
  // Basic support for "SELECT ... UNION SELECT ..."
  // Splitting by UNION keyword (case insensitive)
  if (q.match(/\s+UNION\s+/i)) {
      const isUnionAll = q.match(/\s+UNION\s+ALL\s+/i);
      const separator = isUnionAll ? /\s+UNION\s+ALL\s+/i : /\s+UNION\s+/i;
      const parts = q.split(separator);
      
      let combinedData: any[] = [];
      
      for (let part of parts) {
          const result = executeQuery(part.trim(), tables);
          if (!result.success) return result; // Return error from sub-query
          if (result.data) combinedData = [...combinedData, ...result.data];
      }

      // If NOT "UNION ALL", remove duplicates
      if (!isUnionAll) {
          const seen = new Set();
          combinedData = combinedData.filter(row => {
              const sig = JSON.stringify(row);
              if (seen.has(sig)) return false;
              seen.add(sig);
              return true;
          });
      }

      return { success: true, data: combinedData, message: `UNION Query successful. ${combinedData.length} rows retrieved.` };
  }

  if (!q.toLowerCase().startsWith('select')) {
    return { success: false, error: "SYNTAX ERROR: Query must start with SELECT or WITH" };
  }

  try {
    // --- 1. PARSE SECTIONS ---
    const keywordRegex = /\s+(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT)\s+/gi;
    let match;
    const sections: Record<string, string> = {};
    let lastIndex = 0;
    let lastKeyword = 'SELECT';

    const fromMatch = /\s+FROM\s+/i.exec(q);
    if (!fromMatch) return { success: false, error: "SYNTAX ERROR: Missing FROM clause." };
    
    sections['SELECT'] = q.substring(6, fromMatch.index).trim();
    lastIndex = fromMatch.index + fromMatch[0].length;
    lastKeyword = 'FROM';

    while ((match = keywordRegex.exec(q)) !== null) {
        sections[lastKeyword] = q.substring(lastIndex, match.index).trim();
        lastKeyword = match[1].toUpperCase();
        lastIndex = keywordRegex.lastIndex;
    }
    sections[lastKeyword] = q.substring(lastIndex).trim();

    if (!sections['FROM']) return { success: false, error: "SYNTAX ERROR: Missing FROM clause." };

    // --- 2. FROM & JOIN (With Alias Support) ---
    const joinTokens = sections['FROM'].split(/\s+(LEFT\s+)?JOIN\s+/i);
    const mainTableDef = parseTableStr(joinTokens[0]);
    const mainTable = tables.find(t => t.name.toLowerCase() === mainTableDef.name.toLowerCase());
    
    if (!mainTable) return { success: false, error: `REFERENCE ERROR: Table '${mainTableDef.name}' not found.` };

    let resultData = mainTable.data.map(row => {
        const flatRow: any = { ...row };
        Object.keys(row).forEach(key => {
            flatRow[`${mainTable.name}.${key}`] = row[key]; 
            flatRow[`${mainTableDef.alias}.${key}`] = row[key]; 
        });
        return flatRow;
    });

    for (let i = 1; i < joinTokens.length; i += 2) {
        const joinType = joinTokens[i]; 
        const joinBody = joinTokens[i+1]; 
        const isLeft = joinType && joinType.toUpperCase().includes("LEFT");
        
        const onIndex = joinBody.search(/\s+ON\s+/i);
        if (onIndex === -1) return { success: false, error: "SYNTAX ERROR: JOIN missing ON clause." };

        const joinTableStr = joinBody.substring(0, onIndex).trim();
        const joinTableDef = parseTableStr(joinTableStr);
        const condition = joinBody.substring(onIndex + 4).trim();
        
        const joinTable = tables.find(t => t.name.toLowerCase() === joinTableDef.name.toLowerCase());
        if (!joinTable) return { success: false, error: `REFERENCE ERROR: Table '${joinTableDef.name}' not found.` };

        const newData = [];
        for (const mainRow of resultData) {
            let matchFound = false;
            for (const joinRow of joinTable.data) {
                const tempRow = { ...mainRow }; 
                Object.keys(joinRow).forEach(key => {
                    tempRow[key] = joinRow[key]; 
                    tempRow[`${joinTable.name}.${key}`] = joinRow[key];
                    tempRow[`${joinTableDef.alias}.${key}`] = joinRow[key];
                });

                if (evaluateCondition(tempRow, condition, tables)) {
                    matchFound = true;
                    newData.push(tempRow);
                }
            }
            if (isLeft && !matchFound) {
                const nullRow = { ...mainRow };
                joinTable.columns.forEach(col => {
                    nullRow[col.name] = null;
                    nullRow[`${joinTable.name}.${col.name}`] = null;
                    nullRow[`${joinTableDef.alias}.${col.name}`] = null;
                });
                newData.push(nullRow);
            }
        }
        resultData = newData;
    }

    // --- 3. WHERE ---
    if (sections['WHERE']) {
        const whereClause = sections['WHERE'];
        const orGroups = whereClause.split(/\s+OR\s+/i);
        resultData = resultData.filter(row => {
            return orGroups.some(group => {
                const andConditions = group.split(/\s+AND\s+/i);
                return andConditions.every(cond => evaluateCondition(row, cond, tables));
            });
        });
    }

    // --- 4. GROUP BY ---
    const aggRegex = /(COUNT|SUM|AVG|MAX|MIN)\s*\((.+?)\)/i;
    const selectWithoutWindow = sections['SELECT'].replace(/\s+OVER\s*\(.*?\)/gi, '');
    const hasAggregateInSelect = aggRegex.test(selectWithoutWindow);
    const hasGroupBy = !!sections['GROUP BY'];
    
    let groupedData: any[] = resultData;

    if (hasGroupBy || hasAggregateInSelect) {
        const buckets: Record<string, any[]> = {};
        if (hasGroupBy) {
            const groupKeys = sections['GROUP BY'].split(',').map(k => k.trim());
            resultData.forEach(row => {
                const bucketKey = groupKeys.map(k => getRowValue(row, k)).join('|||');
                if (!buckets[bucketKey]) buckets[bucketKey] = [];
                buckets[bucketKey].push(row);
            });
        } else {
            buckets['ALL'] = resultData;
        }

        groupedData = Object.keys(buckets).map(key => {
            const rows = buckets[key];
            const representative = rows[0] || {};
            const newRow: any = { ...representative };
            const aggMatches = q.matchAll(/(COUNT|SUM|AVG|MAX|MIN)\s*\((.+?)\)/gi);
            for (const match of aggMatches) {
                const fullStr = match[0];
                if (q.includes(fullStr + " OVER")) continue; 
                const func = match[1].toUpperCase();
                const col = match[2];
                newRow[fullStr] = calculateAggregate(func, col, rows);
            }
            return newRow;
        });
    }

    // --- 5. HAVING ---
    if (sections['HAVING']) {
        if (!hasGroupBy && !hasAggregateInSelect) return { success: false, error: "SYNTAX ERROR: HAVING clause requires GROUP BY." };
        const havingClause = sections['HAVING'];
        const orGroups = havingClause.split(/\s+OR\s+/i);
        groupedData = groupedData.filter(row => {
            return orGroups.some(group => {
                const andConditions = group.split(/\s+AND\s+/i);
                return andConditions.every(cond => evaluateCondition(row, cond, tables));
            });
        });
    }
    resultData = groupedData;

    // --- 6. WINDOW FUNCTIONS ---
    if (sections['SELECT'].toUpperCase().includes(' OVER')) {
        resultData = processWindowFunctions(resultData, sections['SELECT']);
    }

    // --- 7. ORDER BY ---
    if (sections['ORDER BY']) {
        const parts = sections['ORDER BY'].split(',').map(p => p.trim());
        resultData.sort((a, b) => {
            for (let part of parts) {
                const [colStr, dir] = part.split(/\s+/);
                const col = colStr.trim();
                const isDesc = dir && dir.toUpperCase() === 'DESC';
                let valA = getRowValue(a, col);
                let valB = getRowValue(b, col);
                if (valA === undefined) valA = null; if (valB === undefined) valB = null;
                if (valA === valB) continue;
                if (valA === null) return 1; if (valB === null) return -1;
                if (valA < valB) return isDesc ? 1 : -1;
                if (valA > valB) return isDesc ? -1 : 1;
            }
            return 0;
        });
    }

    // --- 8. LIMIT (NEW) ---
    if (sections['LIMIT']) {
        const limitVal = parseInt(sections['LIMIT'], 10);
        if (!isNaN(limitVal)) {
            resultData = resultData.slice(0, limitVal);
        }
    }

    // --- 9. SELECT PROJECTION ---
    const selectClause = sections['SELECT'];
    const isDistinct = selectClause.toUpperCase().startsWith('DISTINCT ');
    const columnsStr = isDistinct ? selectClause.substring(9).trim() : selectClause;

    if (columnsStr !== '*') {
        const colDefStrings = [];
        let parenCount = 0;
        let lastSplit = 0;
        for (let i = 0; i < columnsStr.length; i++) {
            if (columnsStr[i] === '(') parenCount++;
            if (columnsStr[i] === ')') parenCount--;
            if (columnsStr[i] === ',' && parenCount === 0) {
                colDefStrings.push(columnsStr.substring(lastSplit, i).trim());
                lastSplit = i + 1;
            }
        }
        colDefStrings.push(columnsStr.substring(lastSplit).trim());

        const colDefs = colDefStrings.map(c => {
            const asMatch = c.match(/^(.+)\s+AS\s+(.+)$/i);
            if (asMatch) return { source: asMatch[1].trim(), alias: asMatch[2].trim() };
            return { source: c.trim(), alias: c.trim() };
        });

        resultData = resultData.map(row => {
            const newRow: any = {};
            colDefs.forEach(def => {
                let val = getRowValue(row, def.source);
                newRow[def.alias] = val !== undefined ? val : null;
            });
            return newRow;
        });
    }

    // --- 10. DISTINCT ---
    if (isDistinct) {
        const seen = new Set();
        resultData = resultData.filter(row => {
            const sig = JSON.stringify(row);
            if (seen.has(sig)) return false;
            seen.add(sig);
            return true;
        });
    }

    return { success: true, data: resultData, message: `Query successful. ${resultData.length} rows retrieved.` };

  } catch (e: any) {
    console.error(e);
    return { success: false, error: "SYSTEM FAILURE: " + (e.message || "Unknown Error") };
  }
};
