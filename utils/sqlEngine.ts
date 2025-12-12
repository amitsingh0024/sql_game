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
    // 1. Exact match (e.g. "SUM(sales)")
    if (row.hasOwnProperty(key)) return row[key];
    
    // 2. Case-insensitive match
    const lowerKey = key.toLowerCase();
    const caseKey = Object.keys(row).find(k => k.toLowerCase() === lowerKey);
    if (caseKey) return row[caseKey];

    // 3. Suffix match (e.g. asking for "id", finding "table.id")
    const suffixKey = Object.keys(row).find(k => k.endsWith('.' + key) || k.toLowerCase().endsWith('.' + lowerKey));
    return suffixKey !== undefined ? row[suffixKey] : undefined;
};

// Evaluate a single condition
const evaluateCondition = (row: any, condition: string): boolean => {
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

  // Handle LIKE operator
  const likeMatch = c.match(/^(.+?)\s+LIKE\s+(.+)$/i);
  if (likeMatch) {
    const col = likeMatch[1].trim();
    const pattern = likeMatch[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
    const val = getRowValue(row, col);
    
    if (typeof val !== 'string') return false;

    // Convert SQL LIKE pattern (%) to Regex (.*)
    // Escape special regex chars except %
    const escapeRegex = (str: string) => str.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    const regexBody = '^' + escapeRegex(pattern).replace(/%/g, '.*') + '$';
    const regex = new RegExp(regexBody, 'i'); // Case insensitive LIKE
    
    return regex.test(val);
  }

  // Handle standard operators
  // Regex: Group 1 (Left), Group 2 (Op), Group 3 (Right)
  // We use .+? for non-greedy match on left side to handle function calls like COUNT(*)
  const operatorMatch = c.match(/^(.+?)\s*(=|<>|!=|>|<|>=|<=)\s*(.+)$/);
  if (!operatorMatch) return false;

  const leftStr = operatorMatch[1].trim();
  const op = operatorMatch[2].trim();
  const rightStr = operatorMatch[3].trim();
  
  // Resolve Values
  // Check if leftStr is a literal
  let leftVal = leftStr.match(/^['"].*['"]$/) || !isNaN(Number(leftStr)) ? leftStr : getRowValue(row, leftStr);
  
  // Check if rightStr is a literal
  let rightVal = rightStr.match(/^['"].*['"]$/) || !isNaN(Number(rightStr)) ? rightStr : getRowValue(row, rightStr);

  // Fallback for unresolved columns (treat as string literal if looks like string)
  if (leftVal === undefined) leftVal = leftStr;
  if (rightVal === undefined) rightVal = rightStr;

  // Unquote
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
    
    // COUNT(*) or COUNT(1)
    if (func === 'COUNT') {
        if (cleanCol === '*' || cleanCol === '1') return rows.length;
        // Count non-null
        return rows.filter(r => {
            const val = getRowValue(r, cleanCol);
            return val !== null && val !== undefined && val !== 'NULL';
        }).length;
    }

    // Extract values for math ops
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

export const executeQuery = (query: string, tables: MockTable[]): QueryResult => {
  let q = query.replace(/[\r\n\t]+/g, ' ').trim();
  
  if (!q.toLowerCase().startsWith('select')) {
    return { success: false, error: "SYNTAX ERROR: Query must start with SELECT" };
  }

  try {
    // --- 1. PARSE SECTIONS ---
    const keywordRegex = /\s+(FROM|WHERE|GROUP BY|HAVING|ORDER BY)\s+/gi;
    let match;
    const sections: Record<string, string> = {};
    let lastIndex = 0;
    let lastKeyword = 'SELECT';

    // Initial SELECT content
    const fromMatch = /\s+FROM\s+/i.exec(q);
    if (!fromMatch) return { success: false, error: "SYNTAX ERROR: Missing FROM clause." };
    
    sections['SELECT'] = q.substring(6, fromMatch.index).trim();
    lastIndex = fromMatch.index + fromMatch[0].length;
    lastKeyword = 'FROM';

    // Scan rest
    while ((match = keywordRegex.exec(q)) !== null) {
        sections[lastKeyword] = q.substring(lastIndex, match.index).trim();
        lastKeyword = match[1].toUpperCase();
        lastIndex = keywordRegex.lastIndex;
    }
    // Final section
    sections[lastKeyword] = q.substring(lastIndex).trim();

    if (!sections['FROM']) return { success: false, error: "SYNTAX ERROR: Missing FROM clause." };

    // --- 2. FROM & JOIN (Flatten Data) ---
    const joinTokens = sections['FROM'].split(/\s+(LEFT\s+)?JOIN\s+/i);
    const mainTableName = joinTokens[0].trim();
    const mainTable = tables.find(t => t.name.toLowerCase() === mainTableName.toLowerCase());
    if (!mainTable) return { success: false, error: `REFERENCE ERROR: Table '${mainTableName}' not found.` };

    let resultData = mainTable.data.map(row => {
        const flatRow: any = { ...row };
        Object.keys(row).forEach(key => {
            flatRow[`${mainTable.name}.${key}`] = row[key];
        });
        return flatRow;
    });

    // Handle Joins
    for (let i = 1; i < joinTokens.length; i += 2) {
        const joinType = joinTokens[i]; 
        const joinBody = joinTokens[i+1]; 
        const isLeft = joinType && joinType.toUpperCase().includes("LEFT");
        
        const onIndex = joinBody.search(/\s+ON\s+/i);
        if (onIndex === -1) return { success: false, error: "SYNTAX ERROR: JOIN missing ON clause." };

        const joinTableName = joinBody.substring(0, onIndex).trim();
        const condition = joinBody.substring(onIndex + 4).trim();
        const joinTable = tables.find(t => t.name.toLowerCase() === joinTableName.toLowerCase());
        if (!joinTable) return { success: false, error: `REFERENCE ERROR: Table '${joinTableName}' not found.` };

        const newData = [];
        for (const mainRow of resultData) {
            let matchFound = false;
            for (const joinRow of joinTable.data) {
                const tempRow = { ...mainRow }; 
                Object.keys(joinRow).forEach(key => {
                    tempRow[key] = joinRow[key];
                    tempRow[`${joinTable.name}.${key}`] = joinRow[key];
                });

                if (evaluateCondition(tempRow, condition)) {
                    matchFound = true;
                    newData.push(tempRow);
                }
            }
            if (isLeft && !matchFound) {
                const nullRow = { ...mainRow };
                joinTable.columns.forEach(col => {
                    if (!nullRow.hasOwnProperty(col.name)) nullRow[col.name] = null;
                    nullRow[`${joinTable.name}.${col.name}`] = null;
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
                return andConditions.every(cond => evaluateCondition(row, cond));
            });
        });
    }

    // --- 4. IDENTIFY AGGREGATIONS IN SELECT/HAVING/ORDER BY ---
    // We need to know if this is an aggregate query even if GROUP BY is missing (implicit group)
    // Regex for FUNC(arg)
    const aggRegex = /(COUNT|SUM|AVG|MAX|MIN)\s*\((.+?)\)/i;
    const hasAggregateInSelect = aggRegex.test(sections['SELECT']);
    const hasGroupBy = !!sections['GROUP BY'];
    
    let groupedData: any[] = resultData; // If no grouping, it's just raw rows

    // --- 5. GROUP BY & AGGREGATION ---
    if (hasGroupBy || hasAggregateInSelect) {
        const buckets: Record<string, any[]> = {};
        
        if (hasGroupBy) {
            const groupKeys = sections['GROUP BY'].split(',').map(k => k.trim());
            
            resultData.forEach(row => {
                // Create a unique key for the bucket based on values of group columns
                const bucketKey = groupKeys.map(k => getRowValue(row, k)).join('|||');
                if (!buckets[bucketKey]) buckets[bucketKey] = [];
                buckets[bucketKey].push(row);
            });
        } else {
            // Implicit group (one big bucket)
            buckets['ALL'] = resultData;
        }

        // Collapse buckets into result rows
        groupedData = Object.keys(buckets).map(key => {
            const rows = buckets[key];
            const representative = rows[0] || {}; // Use first row for non-agg values
            const newRow: any = { ...representative };
            
            // We need to pre-calculate ALL aggregates requested in SELECT, HAVING, ORDER BY
            // Find all agg patterns in the full query string to be safe, or just compute on demand?
            // Safer: Extract all "FUNC(col)" strings from the original query text
            const aggMatches = q.matchAll(/(COUNT|SUM|AVG|MAX|MIN)\s*\((.+?)\)/gi);
            
            for (const match of aggMatches) {
                const fullStr = match[0]; // e.g. "SUM(price)"
                const func = match[1].toUpperCase(); // SUM
                const col = match[2]; // price
                
                // Calculate and store with the key "SUM(price)"
                newRow[fullStr] = calculateAggregate(func, col, rows);
                
                // Also store normalized key "SUM( price )" -> "SUM(price)" handling
                // We'll rely on getRowValue fuzzy matching later
            }
            return newRow;
        });
    }

    // --- 6. HAVING ---
    if (sections['HAVING']) {
        if (!hasGroupBy && !hasAggregateInSelect) {
             return { success: false, error: "SYNTAX ERROR: HAVING clause requires GROUP BY or Aggregation." };
        }
        
        const havingClause = sections['HAVING'];
        const orGroups = havingClause.split(/\s+OR\s+/i);
        groupedData = groupedData.filter(row => {
            return orGroups.some(group => {
                const andConditions = group.split(/\s+AND\s+/i);
                return andConditions.every(cond => evaluateCondition(row, cond));
            });
        });
    }

    resultData = groupedData;

    // --- 7. ORDER BY ---
    if (sections['ORDER BY']) {
        const parts = sections['ORDER BY'].split(',').map(p => p.trim());
        resultData.sort((a, b) => {
            for (let part of parts) {
                const [colStr, dir] = part.split(/\s+/);
                // Handle "ORDER BY COUNT(*) DESC"
                // The key in the object is literally "COUNT(*)" if we calculated it earlier
                // But colStr might be "COUNT(*)"
                
                const col = colStr.trim();
                const isDesc = dir && dir.toUpperCase() === 'DESC';
                
                let valA = getRowValue(a, col);
                let valB = getRowValue(b, col);
                
                if (valA === undefined) valA = null;
                if (valB === undefined) valB = null;

                if (valA === valB) continue;
                if (valA === null) return 1; 
                if (valB === null) return -1;

                if (valA < valB) return isDesc ? 1 : -1;
                if (valA > valB) return isDesc ? -1 : 1;
            }
            return 0;
        });
    }

    // --- 8. SELECT PROJECTION ---
    const selectClause = sections['SELECT'];
    const isDistinct = selectClause.toUpperCase().startsWith('DISTINCT ');
    const columnsStr = isDistinct ? selectClause.substring(9).trim() : selectClause;

    if (columnsStr !== '*') {
        const colDefs = columnsStr.split(',').map(c => {
            // Handle "col AS alias"
            const asMatch = c.match(/^(.+)\s+AS\s+(.+)$/i);
            if (asMatch) {
                return { source: asMatch[1].trim(), alias: asMatch[2].trim() };
            }
            return { source: c.trim(), alias: c.trim() };
        });

        resultData = resultData.map(row => {
            const newRow: any = {};
            colDefs.forEach(def => {
                // If it's an aggregate, it should already be in the row
                let val = getRowValue(row, def.source);
                newRow[def.alias] = val !== undefined ? val : null;
            });
            return newRow;
        });
    }

    // --- 9. DISTINCT (Final) ---
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