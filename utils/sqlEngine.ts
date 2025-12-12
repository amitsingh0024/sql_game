import { MockTable } from '../types';

export interface QueryResult {
  success: boolean;
  data?: any[];
  error?: string;
  message?: string;
}

// Helper to normalize values for comparison
const normalize = (val: any) => {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'string') return val.toLowerCase().replace(/['"]/g, '').trim();
  return val;
};

// Evaluate a single condition (e.g., "age > 10" or "t1.id = t2.ref_id")
const evaluateCondition = (row: any, condition: string): boolean => {
  const c = condition.trim();

  // Handle IS NULL / IS NOT NULL
  if (c.toUpperCase().includes(' IS NULL')) {
    const col = c.replace(/ IS NULL/i, '').trim();
    // Check both direct access and nested access
    const val = row[col];
    return val === null || val === undefined || val === 'NULL';
  }
  if (c.toUpperCase().includes(' IS NOT NULL')) {
    const col = c.replace(/ IS NOT NULL/i, '').trim();
    const val = row[col];
    return val !== null && val !== undefined && val !== 'NULL';
  }

  // Handle standard operators
  const operatorMatch = c.match(/([\w\.]+)\s*(=|<>|!=|>|<|>=|<=)\s*(.+)/);
  if (!operatorMatch) return false;

  const col = operatorMatch[1];
  const op = operatorMatch[2];
  let valStr = operatorMatch[3];
  
  // Resolve Left Value
  let rowVal = row[col];

  // Resolve Right Value (Is it a column or a literal?)
  let val: any = valStr;
  
  if (valStr.match(/^['"].*['"]$/)) {
    // String Literal
    val = valStr.slice(1, -1);
  } else if (valStr.toLowerCase() === 'true') {
    val = true;
  } else if (valStr.toLowerCase() === 'false') {
    val = false;
  } else if (!isNaN(Number(valStr))) {
    // Number Literal
    val = Number(valStr);
  } else {
    // It's likely a column name (e.g. t2.id)
    if (row.hasOwnProperty(valStr)) {
      val = row[valStr];
    }
  }

  // Loose comparison for the game feel
  switch (op) {
    case '=': return normalize(rowVal) == normalize(val);
    case '<>': 
    case '!=': return normalize(rowVal) != normalize(val);
    case '>': return rowVal > val;
    case '<': return rowVal < val;
    case '>=': return rowVal >= val;
    case '<=': return rowVal <= val;
    default: return false;
  }
};

export const executeQuery = (query: string, tables: MockTable[]): QueryResult => {
  let q = query.trim().replace(/\s+/g, ' '); // Normalize spaces
  
  if (!q.toLowerCase().startsWith('select')) {
    return { success: false, error: "SYNTAX ERROR: Query must start with SELECT" };
  }

  try {
    // --- 1. PARSING BASICS ---
    const fromIndex = q.toLowerCase().indexOf(' from ');
    if (fromIndex === -1) return { success: false, error: "SYNTAX ERROR: Missing FROM clause." };

    const selectPart = q.substring(6, fromIndex).trim(); // Text between SELECT and FROM
    
    let remainder = q.substring(fromIndex + 6); // Text after FROM
    
    // --- 2. IDENTIFY TABLES & JOINS ---
    // Simple parser: assumes "FROM TableA [LEFT] JOIN TableB ON TableA.col = TableB.col [WHERE...]"
    
    // Split remainder by clauses to isolate the Table/Join section
    let clauseEndIndex = remainder.search(/(\s+where\s+)|\s+order\s+by\s+|$/i);
    const tableSection = remainder.substring(0, clauseEndIndex).trim();
    remainder = remainder.substring(clauseEndIndex); // This is now WHERE + ORDER BY

    // Parse the table section
    // Check for JOINs
    const joinParts = tableSection.split(/\s+(left\s+)?join\s+/i);
    
    const mainTableName = joinParts[0].trim();
    const mainTable = tables.find(t => t.name.toLowerCase() === mainTableName.toLowerCase());
    
    if (!mainTable) {
        return { success: false, error: `REFERENCE ERROR: Table '${mainTableName}' not found.` };
    }

    // Initialize Working Dataset with Main Table
    // We flatten the data to allow "Table.Column" access
    let resultData = mainTable.data.map(row => {
        const flatRow: any = { ...row };
        // Add prefixed keys
        Object.keys(row).forEach(key => {
            flatRow[`${mainTable.name}.${key}`] = row[key];
        });
        return flatRow;
    });

    // Handle Joins
    // joinParts will look like: ["table1", "LEFT JOIN", "table2 ON ..."] depending on split
    // Let's do a simpler regex loop to handle multiple joins
    
    let currentData = resultData;
    
    // Regex to find: (LEFT )? JOIN (tableName) ON (condition)
    const joinRegex = /(?:(left)\s+)?join\s+(\w+)\s+on\s+([\w\.]+\s*=\s*[\w\.]+)/gi;
    let match;
    
    // We scan the original tableSection string
    while ((match = joinRegex.exec(tableSection)) !== null) {
        const isLeftJoin = !!match[1];
        const joinTableName = match[2];
        const onCondition = match[3];

        const joinTable = tables.find(t => t.name.toLowerCase() === joinTableName.toLowerCase());
        if (!joinTable) return { success: false, error: `REFERENCE ERROR: Joined table '${joinTableName}' not found.` };

        const newData = [];

        // Simple Nested Loop Join (Game data is small, this is fine)
        for (const mainRow of currentData) {
            let matchFound = false;

            for (const joinRow of joinTable.data) {
                // Create a temporary combined row to test the ON condition
                const tempRow = { ...mainRow, ...joinRow };
                // Also add prefixed keys for the join table
                Object.keys(joinRow).forEach(key => {
                    tempRow[`${joinTable.name}.${key}`] = joinRow[key];
                });

                if (evaluateCondition(tempRow, onCondition)) {
                    matchFound = true;
                    newData.push(tempRow);
                    // For standard INNER JOIN, we might match multiple times. 
                }
            }

            if (isLeftJoin && !matchFound) {
                // Add row with NULLs for the joined table
                const nullRow = { ...mainRow };
                joinTable.columns.forEach(col => {
                    nullRow[col.name] = null;
                    nullRow[`${joinTable.name}.${col.name}`] = null;
                });
                newData.push(nullRow);
            }
        }
        
        currentData = newData;
    }
    
    resultData = currentData;


    // --- 3. WHERE CLAUSE ---
    const whereIndex = remainder.toLowerCase().indexOf(' where ');
    const orderIndex = remainder.toLowerCase().indexOf(' order by ');
    
    if (whereIndex !== -1) {
      let whereClause = "";
      if (orderIndex !== -1 && orderIndex > whereIndex) {
        whereClause = remainder.substring(whereIndex + 7, orderIndex);
      } else {
        whereClause = remainder.substring(whereIndex + 7);
      }

      const orGroups = whereClause.split(/\s+or\s+/i);

      resultData = resultData.filter(row => {
        return orGroups.some(group => {
          const andConditions = group.split(/\s+and\s+/i);
          return andConditions.every(cond => evaluateCondition(row, cond));
        });
      });
    }

    // --- 4. ORDER BY CLAUSE ---
    if (orderIndex !== -1) {
      const orderClause = remainder.substring(orderIndex + 10).trim();
      const parts = orderClause.split(',').map(p => p.trim());

      resultData.sort((a, b) => {
        for (let part of parts) {
          const [col, dir] = part.split(/\s+/);
          const isDesc = dir && dir.toLowerCase() === 'desc';
          
          const valA = a[col];
          const valB = b[col];

          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
        }
        return 0;
      });
    }

    // --- 5. SELECT PROJECTION (Columns & Aliases & Distinct) ---
    const isDistinct = selectPart.toLowerCase().startsWith('distinct ');
    const columnsStr = isDistinct ? selectPart.substring(9).trim() : selectPart;

    if (columnsStr !== '*') {
      const colDefs = columnsStr.split(',').map(c => {
        const parts = c.trim().split(/\s+as\s+/i);
        return {
          source: parts[0].trim(),
          alias: parts[1]?.trim() || parts[0].trim()
        };
      });

      // Map Data
      resultData = resultData.map(row => {
        const newRow: any = {};
        colDefs.forEach(def => {
          // Try exact match first (e.g., "table.col")
          if (row.hasOwnProperty(def.source)) {
            newRow[def.alias] = row[def.source];
          } else {
             // Fallback to simple column name match (e.g. "col")
             // Note: In a real DB this would error on ambiguous columns, but here we just take the last one found or checking case-insensitive
             const key = Object.keys(row).find(k => k.toLowerCase() === def.source.toLowerCase() || k.split('.')[1]?.toLowerCase() === def.source.toLowerCase());
             if (key) {
                 newRow[def.alias] = row[key];
             } else {
                 newRow[def.alias] = null; // or Error
             }
          }
        });
        return newRow;
      });
    } else {
        // If SELECT *, we want to clean up the prefixed keys if possible, or just return everything?
        // Let's filter out the "Table.Col" keys for cleaner display if it's a simple query, 
        // but for JOINs, "Table.Col" keys are actually useful to distinguish.
        // For visual cleanliness, let's keep the simple keys if they don't collide.
        // Actually, easiest is just return the row as is, the DataGrid will handle it.
        // We'll just strip the duplicate keys (we have 'id' and 'table.id').
        
        // Simple cleanup: Keep 'Table.Column' format only if there was a join, otherwise keep simple?
        // Let's just return as is.
    }

    // --- 6. HANDLE DISTINCT ---
    if (isDistinct) {
      const seen = new Set();
      resultData = resultData.filter(row => {
        const signature = JSON.stringify(row);
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });
    }

    return { success: true, data: resultData, message: `Query executed. ${resultData.length} rows affected.` };

  } catch (e) {
    console.error(e);
    return { success: false, error: "CRITICAL FAILURE: Logic Core Dumped." };
  }
};
