import { LevelData, ThemeStyle } from '../types';

export const LEVEL_1: LevelData = {
  id: 1,
  title: "DATA DISTRICT",
  description: "The logic core. Shadows are displacing citizens and time is de-synced.",
  theme: ThemeStyle.CYBERPUNK,
  missions: [
    // --- QUEST 1: THE MISSING CITIZENS ---
    
    // Mission 1.1: Basics
    {
      id: "Q1_M1_STABILIZE",
      title: "STABILIZE IDENTITIES",
      story: "ZERO: Everything is flickering... \nNYX: The citizens' render data is corrupted. We need to pull their full records to stabilize them.",
      objective: "Restore the full data stream for the 'citizens' table.",
      hint: "To select everything in a table, use the asterisk wildcard symbol (*).",
      table: {
        name: "citizens",
        columns: [
          { name: "id", type: "number" },
          { name: "name", type: "string" },
          { name: "status", type: "string" },
          { name: "glitch_factor", type: "number" }
        ],
        data: [
          { id: 101, name: "Citizen_A", status: "Flickering", glitch_factor: 10 },
          { id: 102, name: "Citizen_B", status: "Invisible", glitch_factor: 90 },
          { id: 103, name: "Citizen_C", status: "Stable", glitch_factor: 0 }
        ]
      },
      expectedResult: (data) => data.length === 3 && Object.keys(data[0]).length >= 4,
      successMessage: "CITIZENS STABILIZED. They aren't ghosts anymore. Good start."
    },

    // Mission 1.2: Specific Columns
    {
      id: "Q1_M2_RECONSTRUCT",
      title: "RECONSTRUCT RECORDS",
      story: "PIXEL: Some of these guys are still half-loaded. We have partial data fragments. Don't load the whole object, it's too heavy for their corrupted state. Just grab the essentials.",
      objective: "Bandwidth is tight. Retrieve only the 'name' and 'memory_fragment' columns from the 'partial_citizens' table.",
      hint: "Instead of '*', list the specific column names you want after SELECT, separated by a comma.",
      table: {
        name: "partial_citizens",
        columns: [
          { name: "id", type: "number" },
          { name: "name", type: "string" },
          { name: "memory_fragment", type: "string" },
          { name: "junk_data", type: "string" }
        ],
        data: [
          { id: 1, name: "Neo", memory_fragment: "Follow the rabbit", junk_data: "0x0011" },
          { id: 2, name: "Trinity", memory_fragment: "Dodge this", junk_data: "0xDEAD" },
          { id: 3, name: "Morpheus", memory_fragment: "Free your mind", junk_data: "0xBEEF" }
        ]
      },
      expectedResult: (data) => {
        const keys = Object.keys(data[0]);
        return keys.includes('name') && keys.includes('memory_fragment') && !keys.includes('junk_data');
      },
      successMessage: "MEMORY RESTORED. They remember who they are now."
    },

    // Mission 1.3: Aliases
    {
      id: "Q1_M3_DECIPHER",
      title: "DECIPHER LABELS",
      story: "NYX: This table is encrypted. The column names are garbage hex codes. 'x_val' is actually the name, and 'y_stat' is the status. We need to rename them so our HUD can read it.",
      objective: "Retrieve 'x_val' but display it as 'name', and 'y_stat' as 'status' from 'encrypted_citizens'.",
      hint: "Use the 'AS' keyword to rename a column in the output. Example: `SELECT column_name AS new_label`.",
      table: {
        name: "encrypted_citizens",
        columns: [
          { name: "id", type: "number" },
          { name: "x_val", type: "string" },
          { name: "y_stat", type: "string" }
        ],
        data: [
          { id: 1, x_val: "Agent_Smith", y_stat: "Hostile" },
          { id: 2, x_val: "Oracle", y_stat: "Friendly" }
        ]
      },
      expectedResult: (data) => {
        const keys = Object.keys(data[0]);
        return keys.includes('name') && keys.includes('status');
      },
      successMessage: "DECRYPTION COMPLETE. The HUD is reading them clearly."
    },

    // --- QUEST 2: FILTER THE FAKES ---

    // Mission 2.1: NULL Checks
    {
      id: "Q2_M1_NULL",
      title: "FILTER IMPOSTORS",
      story: "PIXEL: Wait, some of these people... they aren't real. They're empty shells. Real citizens have an 'origin_world'. Impostors have NULL origins. Filter out the fake ones!",
      objective: "Filter out the empty shells. Find all entries in 'district_log' where the 'origin_world' exists.",
      hint: "In SQL, you cannot use '= NULL'. Use 'IS NOT NULL' to check if a value exists.",
      table: {
        name: "district_log",
        columns: [
          { name: "id", type: "number" },
          { name: "citizen_name", type: "string" },
          { name: "origin_world", type: "string" }
        ],
        data: [
          { id: 1, citizen_name: "Real_Dave", origin_world: "Earth-616" },
          { id: 2, citizen_name: "Fake_Dave", origin_world: null },
          { id: 3, citizen_name: "Real_Jane", origin_world: "Cyber-City" },
          { id: 4, citizen_name: "Glitch_Mob", origin_world: null }
        ]
      },
      expectedResult: (data) => data.length === 2 && data.every(d => d.origin_world !== 'NULL' && d.origin_world !== null),
      successMessage: "IMPOSTORS DELETED. They just poofed into smoke. Creepy."
    },

    // Mission 2.2: Numeric Filter
    {
      id: "Q2_M2_CORRUPTION",
      title: "CORRUPTION SPIKES",
      story: "NYX: Offensive magic time. We have high-level corruption manifesting. Any entity with a 'glitch_level' higher than 80 is about to explode. Isolate them before they damage the district!",
      objective: "Security Alert! Find all entities in 'population' with a 'glitch_level' strictly higher than 80.",
      hint: "Use the 'WHERE' clause with standard comparison operators like '>' (greater than).",
      table: {
        name: "population",
        columns: [
          { name: "id", type: "number" },
          { name: "entity_type", type: "string" },
          { name: "glitch_level", type: "number" }
        ],
        data: [
          { id: 1, entity_type: "Cat", glitch_level: 10 },
          { id: 2, entity_type: "Hydra_Bus", glitch_level: 95 },
          { id: 3, entity_type: "Mailbox_Mimic", glitch_level: 85 },
          { id: 4, entity_type: "Pigeon", glitch_level: 5 }
        ]
      },
      expectedResult: (data) => data.length === 2 && data.some(d => d.entity_type === 'Hydra_Bus'),
      successMessage: "THREATS CONTAINED. Nice reflex, Weaver."
    },

    // Mission 2.3: Logical Operators
    {
      id: "Q2_M3_COMPLEX",
      title: "SNEAKY GLITCHES",
      story: "ZERO: Some of them are hiding. \nPIXEL: Yeah, the smart glitches. Look for entities that are behaving 'Erratic' AND have 'visual_stability' less than 40. Those are the dangerous ones.",
      objective: "Pinpoint the hidden threat in 'crowd_data'. Look for rows with 'Erratic' behavior AND 'visual_stability' below 40.",
      hint: "You can combine multiple conditions using the 'AND' operator. Both conditions must be true for a row to be selected.",
      table: {
        name: "crowd_data",
        columns: [
          { name: "id", type: "number" },
          { name: "behavior", type: "string" },
          { name: "visual_stability", type: "number" }
        ],
        data: [
          { id: 1, behavior: "Normal", visual_stability: 100 },
          { id: 2, behavior: "Erratic", visual_stability: 20 }, // Target
          { id: 3, behavior: "Erratic", visual_stability: 90 }, // Safe
          { id: 4, behavior: "Calm", visual_stability: 10 } // Safe
        ]
      },
      expectedResult: (data) => data.length === 1 && data[0].id === 2,
      successMessage: "TARGET LOCKED. You caught them right before they multiplied."
    },

    // --- QUEST 3: SORT THE CHAOS ---

    // Mission 3.1: Order By
    {
      id: "Q3_M1_TIME",
      title: "TIME SCRAMBLE",
      story: "NYX: The streets are jammed. People are walking backwards. The timeline is scrambled! We need to reorder the reality events by their timestamp to fix the flow of time.",
      objective: "The timeline is scrambled. Retrieve everything from 'reality_events', sorted by 'timestamp' from oldest to newest.",
      hint: "Use the 'ORDER BY' clause. 'ASC' sorts numbers from small to large.",
      table: {
        name: "reality_events",
        columns: [
          { name: "event_id", type: "number" },
          { name: "action", type: "string" },
          { name: "timestamp", type: "number" }
        ],
        data: [
          { event_id: 1, action: "Cup Falls", timestamp: 1005 },
          { event_id: 2, action: "Cup Breaks", timestamp: 1010 },
          { event_id: 3, action: "Hand Moves", timestamp: 1000 }
        ]
      },
      expectedResult: (data) => data[0].timestamp === 1000 && data[2].timestamp === 1010,
      successMessage: "CAUSALITY RESTORED. Events are happening in the right order again."
    },

    // Mission 3.2: Order Descending
    {
      id: "Q3_M2_PRIORITY",
      title: "THREAT MATRIX",
      story: "PIXEL: We have multiple security alerts. We can't handle them all at once. We need to prioritize. List the threats from highest danger to lowest.",
      objective: "Prioritize the defense. List all threats from 'threat_matrix', sorted from highest 'danger_level' to lowest.",
      hint: "To sort from high to low (largest numbers first), use the 'DESC' keyword after the column name.",
      table: {
        name: "threat_matrix",
        columns: [
          { name: "threat_name", type: "string" },
          { name: "danger_level", type: "number" }
        ],
        data: [
          { threat_name: "Glitch_Rat", danger_level: 10 },
          { threat_name: "Logic_Bomb", danger_level: 9000 },
          { threat_name: "Null_Puddle", danger_level: 50 }
        ]
      },
      expectedResult: (data) => data[0].danger_level === 9000,
      successMessage: "PRIORITY SET. Taking down the big ones first!"
    },

    // --- MINI-BOSS: THE SPOOFER ---
    {
      id: "BOSS_MINI_SPOOFER",
      title: "MINI-BOSS: THE SPOOFER",
      story: "ALERT: ANOMALY DETECTED. \n\nNYX: It's 'The Spoofer'. A shape-shifting glitch. It's creating hundreds of fake copies of itself to hide. \nPIXEL: Don't panic! The copies are perfect, but they lack a 'soul_signature'. The real one has a unique signature. Find the unique one!",
      objective: "The clones are identical, but their signatures aren't. Find the list of unique 'soul_signature' values in 'spoofer_clones' to reveal the real one.",
      hint: "Use the 'DISTINCT' keyword immediately after SELECT to remove duplicate rows from your result.",
      table: {
        name: "spoofer_clones",
        columns: [
          { name: "clone_id", type: "number" },
          { name: "appearance", type: "string" },
          { name: "soul_signature", type: "string" }
        ],
        data: [
          { clone_id: 1, appearance: "Viper", soul_signature: "FAKE_01" },
          { clone_id: 2, appearance: "Viper", soul_signature: "FAKE_01" },
          { clone_id: 3, appearance: "Viper", soul_signature: "FAKE_01" },
          { clone_id: 4, appearance: "Viper", soul_signature: "REAL_ONE" }, // Unique
          { clone_id: 5, appearance: "Viper", soul_signature: "FAKE_01" }
        ]
      },
      expectedResult: (data) => {
        return data.length === 2 && data.some(d => d.soul_signature === 'REAL_ONE');
      },
      successMessage: "ILLUSION SHATTERED. The clones have evaporated. Only the real glitch remains... and it's running away."
    },

    // --- FINAL BOSS: QUERY BEAST ---
    {
      id: "BOSS_FINAL_BEAST",
      title: "FINAL BOSS: QUERY BEAST",
      story: "SYSTEM CRITICAL. MASSIVE CORRUPTION DETECTED. \n\nZERO: What is that thing? \nNYX: It's the Query Beast. A monster made of overlapping bad data. It's blocking the district core. \n\nSTRATEGY:\n1. Target the 'beast_nodes'.\n2. Filter out the 'Shadow' armor (type != 'Shadow').\n3. Hit the 'Critical' weak points first (ORDER BY stability ASC).",
      objective: "Target the Beast! Find the 'node_id' of all 'beast_nodes' that are NOT 'Shadow' type. Sort them by 'stability' (weakest/lowest first) to maximize damage.",
      hint: "Combine a 'WHERE' clause (using '!=') with an 'ORDER BY' clause. Remember the order of operations: SELECT... FROM... WHERE... ORDER BY...",
      table: {
        name: "beast_nodes",
        columns: [
          { name: "node_id", type: "string" },
          { name: "type", type: "string" },
          { name: "stability", type: "number" }
        ],
        data: [
          { node_id: "ARMOR_L", type: "Shadow", stability: 1000 },
          { node_id: "ARMOR_R", type: "Shadow", stability: 1000 },
          { node_id: "CORE_EYE", type: "Critical", stability: 10 }, // Target 1
          { node_id: "CORE_HEART", type: "Critical", stability: 50 }, // Target 2
          { node_id: "TAIL", type: "Standard", stability: 200 }
        ]
      },
      expectedResult: (data) => {
        if (data.length !== 3) return false;
        if (data[0].node_id !== "CORE_EYE") return false;
        return true;
      },
      successMessage: "CORE RUPTURED! The beast is dissolving into raw code. \n\nZERO: 'I... I can see everything now.'\n\nLEVEL COMPLETE. DATA VISION UNLOCKED."
    }
  ]
};

export const LEVEL_2: LevelData = {
  id: 2,
  title: "LINK CITY",
  description: "Floating islands with broken bridges. Reconnect the world using JOINS.",
  theme: ThemeStyle.VAPORWAVE,
  missions: [
    // --- QUEST 1: RECONNECT THE CITIZENS (INNER JOIN) ---
    {
      id: "Q1_RECONNECT",
      title: "THE BROKEN BRIDGES",
      story: "ZERO: This place... the roads are just stopping in mid-air.\nNYX: This is Link City. The bridges represent relationships between tables. The 'citizens' table is disconnected from the 'roles' table. People don't know who they are anymore.",
      objective: "Rebuild the bridge. Perform a JOIN between 'citizens' and 'roles' so that 'citizens.role_id' matches 'roles.id'.",
      hint: "Use `JOIN table2 ON table1.column = table2.column`. This connects rows where the values match.",
      tables: [
        {
          name: "citizens",
          columns: [{name: "id", type: "number"}, {name: "name", type: "string"}, {name: "role_id", type: "number"}],
          data: [
             {id: 1, name: "Data_Miner", role_id: 101},
             {id: 2, name: "Net_Runner", role_id: 102},
             {id: 3, name: "Lost_Soul", role_id: 999} // 999 doesn't exist in roles
          ]
        },
        {
          name: "roles",
          columns: [{name: "id", type: "number"}, {name: "role_name", type: "string"}],
          data: [
             {id: 101, role_name: "Miner"}, // FIXED: Key matches column definition
             {id: 102, role_name: "Runner"},
             {id: 103, role_name: "Admin"}
          ]
        }
      ],
      expectedResult: (data) => {
         // Should contain 2 rows (Lost_Soul dropped by Inner Join)
         // Should have name and role_name
         return data.length === 2 && data.some(d => d.name === "Data_Miner" && (d.role_name === "Miner" || d['roles.role_name'] === "Miner"));
      },
      successMessage: "CONNECTION ESTABLISHED. The bridge is glowing again!"
    },

    // --- QUEST 2: TRACE LOST RECORDS (LEFT JOIN / IS NULL) ---
    {
      id: "Q2_LOST_ISLANDS",
      title: "GHOST ISLANDS",
      story: "PIXEL: Some of these islands are drifting into the void! They have no anchor points.\nNYX: We need to find the 'sectors' that do NOT have a matching 'anchor'. Use a LEFT JOIN to include everyone, then filter for the ones where the anchor is missing.",
      objective: "Find the drifting sectors. LEFT JOIN 'sectors' with 'anchors' on 'id = sector_id', then select only rows where 'anchors.id' IS NULL.",
      hint: "A LEFT JOIN keeps all rows from the first table. If there's no match, the second table's columns will be NULL.",
      tables: [
        {
          name: "sectors",
          columns: [{name: "id", type: "number"}, {name: "sector_name", type: "string"}],
          data: [
             {id: 1, sector_name: "Neon_Plaza"},
             {id: 2, sector_name: "Void_Edge"}, // No anchor
             {id: 3, sector_name: "Core_Hub"}
          ]
        },
        {
          name: "anchors",
          columns: [{name: "id", type: "number"}, {name: "sector_id", type: "number"}, {name: "status", type: "string"}],
          data: [
             {id: 50, sector_id: 1, status: "Active"},
             {id: 51, sector_id: 3, status: "Active"}
          ]
        }
      ],
      expectedResult: (data) => {
         // Should only be Void_Edge
         return data.length === 1 && data[0].sector_name === "Void_Edge";
      },
      successMessage: "DRIFTERS IDENTIFIED. We can grapple them back to safety now."
    },

    // --- MINI BOSS: THE BRIDGE PHANTOM ---
    {
      id: "BOSS_PHANTOM",
      title: "MINI-BOSS: BRIDGE PHANTOM",
      story: "ALERT: ENTITY DETECTED.\n\nThe Bridge Phantom is scrambling the navigation! It's linking people to the wrong homes.\n\nPIXEL: It's connecting everyone to 'House_404'! That house doesn't exist! \n\nOBJECTIVE: Find the civilians who are incorrectly linked to 'House_404'.",
      objective: "JOIN 'civilians' and 'housing_assignments' on 'id = civilian_id'. Filter for rows where 'house_code' equals 'House_404'.",
      hint: "Perform the JOIN first, then add a WHERE clause to check the 'house_code'.",
      tables: [
        {
           name: "civilians",
           columns: [{name: "id", type: "number"}, {name: "name", type: "string"}],
           data: [
              {id: 1, name: "Alice"},
              {id: 2, name: "Bob"},
              {id: 3, name: "Charlie"}
           ]
        },
        {
           name: "housing_assignments",
           columns: [{name: "civilian_id", type: "number"}, {name: "house_code", type: "string"}],
           data: [
              {civilian_id: 1, house_code: "Apt_101"},
              {civilian_id: 2, house_code: "House_404"}, // Target
              {civilian_id: 3, house_code: "House_404"}  // Target
           ]
        }
      ],
      expectedResult: (data) => data.length === 2 && data.every(d => d.house_code === "House_404"),
      successMessage: "PHANTOM DESTABILIZED! It can't hide behind bad links anymore."
    },

    // --- FINAL BOSS: RELATIONSHIP REAPER ---
    {
      id: "BOSS_REAPER",
      title: "FINAL BOSS: RELATIONSHIP REAPER",
      story: "WARNING: REALITY COLLAPSE IMMINENT.\n\nThe Relationship Reaper is trying to sever the connection between the 'Grid', the 'Power', and the 'Users'. It's a three-way disconnect!\n\nNYX: You need to re-align the flow. Connect 'users' to 'grid_access', AND 'grid_access' to 'power_nodes'.\n\nFind the user 'Zero' and trace his path to the 'Core_Battery'.",
      objective: "Perform a double JOIN! \n1. FROM users JOIN grid_access ON users.id = grid_access.user_id \n2. JOIN power_nodes ON grid_access.node_id = power_nodes.id \n\nFilter for users.name = 'Zero'.",
      hint: "You can chain JOINs: FROM A JOIN B ON ... JOIN C ON ...",
      tables: [
        {
           name: "users",
           columns: [{name: "id", type: "number"}, {name: "name", type: "string"}],
           data: [{id: 1, name: "Zero"}, {id: 2, name: "Enemy"}]
        },
        {
           name: "grid_access",
           columns: [{name: "user_id", type: "number"}, {name: "node_id", type: "number"}],
           data: [{user_id: 1, node_id: 99}, {user_id: 2, node_id: 66}]
        },
        {
           name: "power_nodes",
           columns: [{name: "id", type: "number"}, {name: "node_name", type: "string"}],
           data: [{id: 99, node_name: "Core_Battery"}, {id: 66, node_name: "Dark_Cell"}]
        }
      ],
      expectedResult: (data) => {
         // Should return Zero -> Core_Battery
         return data.length === 1 && data[0].name === "Zero" && (data[0].node_name === "Core_Battery" || data[0]['power_nodes.node_name'] === "Core_Battery");
      },
      successMessage: "FATAL ERROR FIXED! The Reaper exploded into a million puzzle pieces.\n\nZERO: 'I can see the threads connecting everything now.'\n\nABILITY UNLOCKED: BRIDGE-MAKER."
    }
  ]
};

export const LEVEL_3: LevelData = {
  id: 3,
  title: "MARKETVERSE",
  description: "Floating islands of chaotic trade. Restore order using GROUP BY and AGGREGATIONS.",
  theme: ThemeStyle.CYBERPUNK, // Using Cyberpunk style for high-tech market feel
  missions: [
    // --- QUEST 1: RESTORE THE MERCHANT CLUSTERS (GROUP BY) ---
    {
      id: "Q1_CLUSTERS",
      title: "RESTORE CLUSTERS",
      story: "NYX: Look at this mess. The merchant islands are scattering! \nPIXEL: They've lost their grouping tags. We need to identify the natural clusters.\n\nOBJECTIVE: Group the merchants by their 'region' and count how many are in each. This will create gravity wells to pull them back together.",
      objective: "Group merchants by 'region' and COUNT(*) them.",
      hint: "Use `SELECT region, COUNT(*) FROM merchants GROUP BY region`.",
      table: {
        name: "merchants",
        columns: [{ name: "id", type: "number" }, { name: "name", type: "string" }, { name: "region", type: "string" }],
        data: [
          { id: 1, name: "Vendor_A", region: "North_Dock" },
          { id: 2, name: "Vendor_B", region: "North_Dock" },
          { id: 3, name: "Vendor_C", region: "South_Plaza" },
          { id: 4, name: "Vendor_D", region: "North_Dock" },
          { id: 5, name: "Vendor_E", region: "South_Plaza" }
        ]
      },
      expectedResult: (data) => {
        // Should have 2 rows: North_Dock (3) and South_Plaza (2)
        const north = data.find(d => d.region === "North_Dock");
        const south = data.find(d => d.region === "South_Plaza");
        const countKey = Object.keys(data[0]).find(k => k.toUpperCase().includes('COUNT'));
        return data.length === 2 && north && south && north[countKey!] === 3;
      },
      successMessage: "CLUSTERS STABILIZED. Gravity wells active. The islands are drifting back into formation."
    },

    // --- QUEST 2: MEASURE THE MARKET FLOW (AVG) ---
    {
      id: "Q2_FLOW",
      title: "MEASURE THE FLOW",
      story: "PIXEL: Math never lies, but the Glitch sure does. It's inflating the prices!\nZERO: I see numbers flying everywhere. \nNYX: Calculate the real average price for each 'item_type'. If we know the true value, we can reset the market.",
      objective: "Calculate the average price per item type. Use `AVG(price)` and group by 'item_type'.",
      hint: "Structure: `SELECT item_type, AVG(price) FROM trades GROUP BY item_type`.",
      table: {
        name: "trades",
        columns: [{ name: "id", type: "number" }, { name: "item_type", type: "string" }, { name: "price", type: "number" }],
        data: [
          { id: 1, item_type: "Data_Shard", price: 100 },
          { id: 2, item_type: "Data_Shard", price: 200 },
          { id: 3, item_type: "Cyber_Deck", price: 1000 },
          { id: 4, item_type: "Cyber_Deck", price: 2000 }
        ]
      },
      expectedResult: (data) => {
        // Data_Shard avg 150, Cyber_Deck avg 1500
        const shard = data.find(d => d.item_type === "Data_Shard");
        const deck = data.find(d => d.item_type === "Cyber_Deck");
        const avgKey = Object.keys(data[0]).find(k => k.toUpperCase().includes('AVG'));
        return shard && deck && shard[avgKey!] === 150 && deck[avgKey!] === 1500;
      },
      successMessage: "PRICES RESET. The inflation bubble just popped."
    },

    // --- QUEST 3: EXPOSE FRAUDULENT FACTIONS (HAVING) ---
    {
      id: "Q3_FRAUD",
      title: "EXPOSE THE FRAUD",
      story: "NYX: Corruption hides in numbers. Some factions are faking their power levels to intimidate others.\nPIXEL: They are using shell guilds. Real factions have a total power over 500. Anything less is a fake shell.\n\nOBJECTIVE: Sum the 'power' of each 'faction', but only show the ones having a total power greater than 500.",
      objective: "Find the powerful factions. `GROUP BY faction` and use `HAVING SUM(power) > 500`.",
      hint: "WHERE filters rows before grouping. HAVING filters groups after aggregation.",
      table: {
        name: "guilds",
        columns: [{ name: "guild_id", type: "number" }, { name: "faction", type: "string" }, { name: "power", type: "number" }],
        data: [
          { guild_id: 1, faction: "Iron_Code", power: 300 },
          { guild_id: 2, faction: "Iron_Code", power: 400 }, // Sum: 700 (Keep)
          { guild_id: 3, faction: "Ghost_Script", power: 100 },
          { guild_id: 4, faction: "Ghost_Script", power: 100 } // Sum: 200 (Drop)
        ]
      },
      expectedResult: (data) => {
        // Only Iron_Code should remain
        return data.length === 1 && data[0].faction === "Iron_Code";
      },
      successMessage: "FRAUD DETECTED. The fake factions are dissolving into static."
    },

    // --- MINI-BOSS: THE OVER-COUNTER ITERATOR ---
    {
      id: "BOSS_ITERATOR",
      title: "MINI-BOSS: THE ITERATOR",
      story: "ALERT: GLITCH DETECTED.\n\nIt's The Iterator! It's cloning transaction records to crash the server.\n\nPIXEL: It's duplicating transactions! A real merchant ID should only appear once in this log. \n\nOBJECTIVE: Find the 'merchant_id' that appears more than once! Count them and filter with HAVING > 1.",
      objective: "Identify the glitch. `SELECT merchant_id, COUNT(*) FROM transaction_log GROUP BY merchant_id HAVING COUNT(*) > 1`.",
      hint: "Group by the ID, count them, then keep only counts greater than 1.",
      table: {
        name: "transaction_log",
        columns: [{ name: "log_id", type: "number" }, { name: "merchant_id", type: "number" }, { name: "status", type: "string" }],
        data: [
          { log_id: 1, merchant_id: 101, status: "Ok" },
          { log_id: 2, merchant_id: 102, status: "Ok" },
          { log_id: 3, merchant_id: 103, status: "Ok" },
          { log_id: 4, merchant_id: 102, status: "Dupe" } // 102 is the target
        ]
      },
      expectedResult: (data) => {
        return data.length === 1 && data[0].merchant_id === 102;
      },
      successMessage: "ITERATOR CRASHED. You just cleaned up a million fake receipts. That's some accountant-level power."
    },

    // --- FINAL BOSS: THE PROFIT EATER TITAN ---
    {
      id: "BOSS_PROFIT_TITAN",
      title: "FINAL BOSS: PROFIT EATER",
      story: "WARNING: MASSIVE ENTITY APPROACHING.\n\nThe Profit Eater Titan is made of corrupted financial data. It feeds on negative stability.\n\nZERO: It's... it's huge. It's swirling with bad math.\nNYX: To destroy it, we need to isolate the unstable clusters and collapse them. \n\nOBJECTIVE: Find 'cluster_id's where the SUM of 'stability_index' is NEGATIVE (less than 0). Order them by the sum (lowest first) to hit the weakest point.",
      objective: "Target the instability! `GROUP BY cluster_id`, `HAVING SUM(stability_index) < 0`, and `ORDER BY SUM(stability_index) ASC`.",
      hint: "Combine GROUP BY, HAVING, and ORDER BY. Remember the order: GROUP -> HAVING -> ORDER.",
      table: {
        name: "market_clusters",
        columns: [{ name: "id", type: "number" }, { name: "cluster_id", type: "string" }, { name: "stability_index", type: "number" }],
        data: [
          { id: 1, cluster_id: "Alpha", stability_index: 100 },
          { id: 2, cluster_id: "Alpha", stability_index: 50 }, // Sum 150 (Safe)
          { id: 3, cluster_id: "Beta", stability_index: -200 },
          { id: 4, cluster_id: "Beta", stability_index: 50 }, // Sum -150 (Target 2)
          { id: 5, cluster_id: "Gamma", stability_index: -500 }, // Sum -500 (Target 1 - Lowest)
        ]
      },
      expectedResult: (data) => {
        // Should have Gamma (-500) then Beta (-150)
        if (data.length !== 2) return false;
        const sumKey = Object.keys(data[0]).find(k => k.toUpperCase().includes('SUM'));
        const first = data[0];
        const second = data[1];
        return first.cluster_id === "Gamma" && second.cluster_id === "Beta" && first[sumKey!] < second[sumKey!];
      },
      successMessage: "TITAN COLLAPSED! \n\nNYX: 'You didn't just fix the market. You understood it.'\n\nABILITY UNLOCKED: BULK PROCESSOR (Level 3 Complete)."
    }
  ]
};

export const LEVEL_4: LevelData = {
  id: 4,
  title: "CENSUS CORE",
  description: "Identity tablets are collapsing. Restore structural integrity using Normalization and Design patterns.",
  theme: ThemeStyle.BLUEPRINT,
  missions: [
    // --- QUEST 1: IDENTITY ANOMALIES (1NF - Atomicity) ---
    {
      id: "Q1_ATOMICITY",
      title: "ATOMICITY BREACH",
      story: "ZERO: This sphere... it's full of floating glass tablets. \nNYX: This is the Census Core. The blueprint of everyone. But look at these records. \nPIXEL: They're jamming multiple values into one field! 'Skills' should be atomic, not a comma-separated mess. \n\nOBJECTIVE: Find the corrupted records where 'attributes' contains a comma.",
      objective: "Identify non-atomic data. `SELECT * FROM identity_fragments WHERE attributes LIKE '%,%'`.",
      hint: "The `%` symbol is a wildcard. `LIKE '%,%'` finds any text containing a comma.",
      table: {
        name: "identity_fragments",
        columns: [{ name: "id", type: "number" }, { name: "citizen", type: "string" }, { name: "attributes", type: "string" }],
        data: [
          { id: 1, citizen: "Neo", attributes: "Flying" },
          { id: 2, citizen: "Trinity", attributes: "Combat,Hacking" }, // Target
          { id: 3, citizen: "Morpheus", attributes: "Wisdom" },
          { id: 4, citizen: "Smith", attributes: "Replication,Speed,Strength" } // Target
        ]
      },
      expectedResult: (data) => data.length === 2 && data.some(d => d.citizen === "Trinity"),
      successMessage: "CLUSTERS SEPARATED. One value per field. That's the First Law of Structure."
    },

    // --- QUEST 2: PARTIAL DEPENDENCE (2NF) ---
    {
      id: "Q2_DEPENDENCY",
      title: "UNPACK DEPENDENCIES",
      story: "NYX: These tablets are bloated. They're repeating data unnecessarily.\nPIXEL: The 'job_description' depends only on the 'job', not the specific citizen. We need to split this table to stop the redundancy bleed.\n\nOBJECTIVE: Create a clean list of jobs and their descriptions to prepare for extraction.",
      objective: "Normalize the data. `SELECT DISTINCT job, job_description FROM workforce`.",
      hint: "DISTINCT removes duplicates, giving you a clean list of unique job definitions.",
      table: {
        name: "workforce",
        columns: [{ name: "id", type: "number" }, { name: "name", type: "string" }, { name: "job", type: "string" }, { name: "job_description", type: "string" }],
        data: [
          { id: 1, name: "A", job: "Coder", job_description: "Writes code" },
          { id: 2, name: "B", job: "Coder", job_description: "Writes code" }, // Redundant
          { id: 3, name: "C", job: "Designer", job_description: "Makes art" },
          { id: 4, name: "D", job: "Designer", job_description: "Makes art" } // Redundant
        ]
      },
      expectedResult: (data) => data.length === 2 && data.some(d => d.job === "Coder"),
      successMessage: "REDUNDANCY PURGED. We can move these to their own table now."
    },

    // --- QUEST 3: TRANSITIVE CORRUPTION (3NF) ---
    {
      id: "Q3_TRANSITIVE",
      title: "HIDDEN SHADOWS",
      story: "ZERO: I see a chain reaction. When a planet changes, the ruler changes too, but they are linked to the citizen record!\nNYX: That's a Transitive Dependency. The 'ruler' depends on 'planet', not the citizen. We need to isolate the planet-ruler relationship.\n\nOBJECTIVE: Extract the unique planet governance rules.",
      objective: "Break the chain. `SELECT DISTINCT planet, ruler FROM galaxy_census`.",
      hint: "Find the relationship that doesn't belong to the primary key (the citizen).",
      table: {
        name: "galaxy_census",
        columns: [{ name: "citizen_id", type: "number" }, { name: "planet", type: "string" }, { name: "ruler", type: "string" }],
        data: [
          { citizen_id: 1, planet: "Mars", ruler: "Elon_X" },
          { citizen_id: 2, planet: "Mars", ruler: "Elon_X" },
          { citizen_id: 3, planet: "Venus", ruler: "Queen_V" },
          { citizen_id: 4, planet: "Venus", ruler: "Queen_V" }
        ]
      },
      expectedResult: (data) => data.length === 2 && data.some(d => d.planet === "Mars"),
      successMessage: "LINKS SEVERED. The citizens are free from planetary politics."
    },

    // --- MINI-BOSS: THE REDUNDANCY SWARM ---
    {
      id: "BOSS_SWARM",
      title: "MINI-BOSS: REDUNDANCY SWARM",
      story: "ALERT: SWARM DETECTED.\n\nA cloud of duplicate identities is attacking! It regrows unless you find the source.\n\nPIXEL: It's duplicating IDs! A primary key MUST be unique. Find the ID that appears more than once!\n\nOBJECTIVE: `SELECT id, COUNT(*) FROM identity_stream GROUP BY id HAVING COUNT(*) > 1`.",
      objective: "Target the duplicate. Group by ID and find counts > 1.",
      hint: "Use GROUP BY and HAVING to find duplicates.",
      table: {
        name: "identity_stream",
        columns: [{ name: "row_num", type: "number" }, { name: "id", type: "string" }, { name: "status", type: "string" }],
        data: [
          { row_num: 1, id: "USER_01", status: "Active" },
          { row_num: 2, id: "USER_02", status: "Active" },
          { row_num: 3, id: "USER_03", status: "Active" },
          { row_num: 4, id: "USER_02", status: "Corrupted" } // Duplicate ID
        ]
      },
      expectedResult: (data) => data.length === 1 && data[0].id === "USER_02",
      successMessage: "SWARM DISSOLVED. Unique constraints re-established."
    },

    // --- FINAL BOSS: THE ANOMALY KING ---
    {
      id: "BOSS_ANOMALY_KING",
      title: "FINAL BOSS: ANOMALY KING",
      story: "WARNING: STRUCTURAL COLLAPSE.\n\nThe Anomaly King is a mass of broken schema fragments. He has torn the 'identities' apart from their 'biometrics'.\n\nNYX: We have to rebuild the Master Schema. Reconnect the 'identities' to 'biometrics' and 'records' to form the Complete Citizen.\n\nOBJECTIVE: `SELECT * FROM identities JOIN biometrics ON identities.id = biometrics.user_id JOIN records ON identities.id = records.user_id`.",
      objective: "Rebuild the Schema. Perform a double JOIN to connect all three tables on the user_id.",
      hint: "Chain two JOINS. `FROM A JOIN B ON ... JOIN C ON ...`",
      tables: [
        {
          name: "identities",
          columns: [{ name: "id", type: "number" }, { name: "name", type: "string" }],
          data: [{ id: 1, name: "Zero" }, { id: 2, name: "Glitch" }]
        },
        {
          name: "biometrics",
          columns: [{ name: "user_id", type: "number" }, { name: "scan_code", type: "string" }],
          data: [{ user_id: 1, scan_code: "Z-100" }, { user_id: 2, scan_code: "G-900" }]
        },
        {
          name: "records",
          columns: [{ name: "user_id", type: "number" }, { name: "rank", type: "string" }],
          data: [{ user_id: 1, rank: "Weaver" }, { user_id: 2, rank: "Guard" }]
        }
      ],
      expectedResult: (data) => data.length === 2 && Object.keys(data[0]).length >= 4,
      successMessage: "SCHEMA RESTORED! The Anomaly King has been formatted into oblivion. \n\nZERO: 'I see the blueprint of everything.'\n\nABILITY UNLOCKED: SCHEMA ARCHITECT."
    }
  ]
};

export const LEVEL_5: LevelData = {
    id: 5,
    title: "WARPSPACE",
    description: "Reality is folding into itself. Use Subqueries and CTEs to navigate nested logic.",
    theme: ThemeStyle.FRACTAL,
    missions: [
        // --- QUEST 1: HIDDEN SPIES (SUBQUERIES) ---
        {
            id: "Q1_SPIES",
            title: "TRACE HIDDEN SPIES",
            story: "NYX: We're in Warpspace. Things here exist inside other things.\nPIXEL: There are spies infiltrated among the citizens, but they are only listed in the hidden 'covert_ops' file. \n\nOBJECTIVE: Find the citizens who are also secret agents. Use a subquery to check if their ID is inside the 'covert_ops' list.",
            objective: "Find the spies. `SELECT * FROM citizens WHERE id IN (SELECT agent_id FROM covert_ops)`.",
            hint: "Use `IN (SELECT ...)` to filter based on another table.",
            tables: [
                {
                    name: "citizens",
                    columns: [{ name: "id", type: "number" }, { name: "name", type: "string" }],
                    data: [
                        { id: 1, name: "Citizen_A" },
                        { id: 2, name: "Citizen_B" },
                        { id: 3, name: "Citizen_C" }
                    ]
                },
                {
                    name: "covert_ops",
                    columns: [{ name: "agent_id", type: "number" }, { name: "codename", type: "string" }],
                    data: [
                        { agent_id: 2, codename: "Shadow" },
                        { agent_id: 99, codename: "Ghost" }
                    ]
                }
            ],
            expectedResult: (data) => data.length === 1 && data[0].name === "Citizen_B",
            successMessage: "SPIES EXPOSED. The hidden layer has been revealed."
        },

        // --- QUEST 2: MULTI-LAYER MAPS (CTE) ---
        {
            id: "Q2_LAYERS",
            title: "RECONSTRUCT MAPS",
            story: "ZERO: This map is a fractal. It goes on forever.\nPIXEL: We need to simplify it. Let's isolate the 'Deep' layer first, then search inside it. \n\nOBJECTIVE: Use a CTE (Common Table Expression) to create a temporary table 'deep_zones' for zones with layer='Deep', then select the 'Unstable' ones from it.",
            objective: "Use a CTE. `WITH deep_zones AS (SELECT * FROM zones WHERE layer = 'Deep') SELECT * FROM deep_zones WHERE status = 'Unstable'`.",
            hint: "Start with `WITH name AS (...)` then write your main query.",
            table: {
                name: "zones",
                columns: [{ name: "id", type: "number" }, { name: "name", type: "string" }, { name: "layer", type: "string" }, { name: "status", type: "string" }],
                data: [
                    { id: 1, name: "Surface_A", layer: "Surface", status: "Stable" },
                    { id: 2, name: "Deep_B", layer: "Deep", status: "Stable" },
                    { id: 3, name: "Deep_C", layer: "Deep", status: "Unstable" }, // Target
                    { id: 4, name: "Void_D", layer: "Void", status: "Unstable" }
                ]
            },
            expectedResult: (data) => data.length === 1 && data[0].name === "Deep_C",
            successMessage: "LAYERS STABILIZED. The fractal collapse has stopped."
        },

        // --- QUEST 3: ENDLESS LOOP (NESTED LOGIC) ---
        {
            id: "Q3_LOOP",
            title: "BREAK THE LOOP",
            story: "NYX: We're stuck in a time loop! The exit leads back to the start.\nZERO: I can see the pattern. \nPIXEL: Find the rooms that are flagged as 'Loop' in the 'paths' table.\n\nOBJECTIVE: Select all rooms where the ID is IN the list of 'next_room' from paths where type is 'Loop'.",
            objective: "Break the cycle. `SELECT * FROM rooms WHERE id IN (SELECT next_room FROM paths WHERE type = 'Loop')`.",
            hint: "Filter the paths first in the subquery, then find the matching rooms.",
            tables: [
                {
                    name: "rooms",
                    columns: [{ name: "id", type: "number" }, { name: "name", type: "string" }],
                    data: [
                        { id: 101, name: "Entrance" },
                        { id: 102, name: "Hallway" },
                        { id: 103, name: "Trap" }
                    ]
                },
                {
                    name: "paths",
                    columns: [{ name: "path_id", type: "number" }, { name: "next_room", type: "number" }, { name: "type", type: "string" }],
                    data: [
                        { path_id: 1, next_room: 102, type: "Safe" },
                        { path_id: 2, next_room: 103, type: "Loop" } // Target 103
                    ]
                }
            ],
            expectedResult: (data) => data.length === 1 && data[0].name === "Trap",
            successMessage: "LOOP BROKEN. Time is flowing forward again."
        },

        // --- BOSS: RECURSION ENTITY ---
        {
            id: "BOSS_RECURSION",
            title: "FINAL BOSS: RECURSION ENTITY",
            story: "WARNING: RECURSIVE PARADOX DETECTED.\n\nThe Recursion Entity is hiding its core inside a shell, inside a shield, inside a distortion.\n\nSTRATEGY: You need to peel the layers.\n1. Create a CTE 'exposed_core' for nodes that are 'Vulnerable'.\n2. Select from 'exposed_core' where the 'power_level' is greater than 9000.",
            objective: "Target the Core. `WITH exposed_core AS (SELECT * FROM entity_nodes WHERE state = 'Vulnerable') SELECT * FROM exposed_core WHERE power > 9000`.",
            hint: "Combine a CTE with a WHERE clause.",
            table: {
                name: "entity_nodes",
                columns: [{ name: "node_id", type: "string" }, { name: "state", type: "string" }, { name: "power", type: "number" }],
                data: [
                    { node_id: "SHELL", state: "Shielded", power: 5000 },
                    { node_id: "DECOY", state: "Vulnerable", power: 100 },
                    { node_id: "CORE", state: "Vulnerable", power: 9999 } // Target
                ]
            },
            expectedResult: (data) => data.length === 1 && data[0].node_id === "CORE",
            successMessage: "ENTITY DELETED. Warpspace has unfolded into a stable plane.\n\nZERO: 'I can see... deeper than before.'\n\nABILITY UNLOCKED: MULTILAYER SIGHT."
        }
    ]
};

export const LEVEL_6: LevelData = {
    id: 6,
    title: "TIME LABYRINTH",
    description: "A swirling maze of broken timelines. Master Window Functions to restore the flow of events.",
    theme: ThemeStyle.CHRONO,
    missions: [
        // --- QUEST 1: REBUILD SEQUENCES (ROW_NUMBER) ---
        {
            id: "Q1_SEQUENCE",
            title: "REBUILD SEQUENCES",
            story: "NYX: Time is out of order. Events are happening randomly.\nPIXEL: We need to assign a proper sequence number to each event based on its timestamp.\n\nOBJECTIVE: Use `ROW_NUMBER() OVER (ORDER BY timestamp)` to generate a clean sequential ID for the events.",
            objective: "Restore order. `SELECT event_name, ROW_NUMBER() OVER (ORDER BY timestamp) FROM temporal_log`.",
            hint: "ROW_NUMBER() generates a unique number for each row based on the ORDER BY clause.",
            table: {
                name: "temporal_log",
                columns: [{ name: "id", type: "number" }, { name: "event_name", type: "string" }, { name: "timestamp", type: "number" }],
                data: [
                    { id: 99, event_name: "End", timestamp: 3000 },
                    { id: 50, event_name: "Middle", timestamp: 2000 },
                    { id: 10, event_name: "Start", timestamp: 1000 }
                ]
            },
            expectedResult: (data) => {
                // Check if the Start event has row number 1
                const start = data.find(d => d.event_name === "Start");
                const end = data.find(d => d.event_name === "End");
                // Find the key that holds the window function result
                const keys = Object.keys(data[0]);
                const rowNumKey = keys.find(k => k.includes("ROW_NUMBER"));
                return start && end && start[rowNumKey!] === 1 && end[rowNumKey!] === 3;
            },
            successMessage: "SEQUENCE RESTORED. Time flows linearly again."
        },

        // --- QUEST 2: ANALYZE CYCLES (LAG) ---
        {
            id: "Q2_CYCLES",
            title: "DETECT LOOPS",
            story: "ZERO: I feel like I've been here before.\nNYX: You have. It's a time loop. We need to compare the current room with the *previous* room visited to spot the repetition.\n\nOBJECTIVE: Use `LAG(room_name) OVER (ORDER BY visit_time)` to see the previous room next to the current one.",
            objective: "Spot the loop. `SELECT room_name, LAG(room_name) OVER (ORDER BY visit_time) FROM travel_log`.",
            hint: "LAG() accesses data from the previous row in the window.",
            table: {
                name: "travel_log",
                columns: [{ name: "visit_id", type: "number" }, { name: "room_name", type: "string" }, { name: "visit_time", type: "number" }],
                data: [
                    { visit_id: 1, room_name: "Library", visit_time: 100 },
                    { visit_id: 2, room_name: "Garden", visit_time: 200 },
                    { visit_id: 3, room_name: "Library", visit_time: 300 } // Loop
                ]
            },
            expectedResult: (data) => {
                const lastEntry = data[2];
                const keys = Object.keys(lastEntry);
                const lagKey = keys.find(k => k.includes("LAG"));
                return lastEntry.room_name === "Library" && lastEntry[lagKey!] === "Garden";
            },
            successMessage: "LOOP IDENTIFIED. We can break out of the cycle now."
        },

        // --- QUEST 3: PREDICT COLLAPSE (LEAD) ---
        {
            id: "Q3_PREDICT",
            title: "PREDICT COLLAPSE",
            story: "PIXEL: A storm is coming! We need to know what happens *next* before it happens.\nNYX: Use the Chrono-Reader. Look ahead in the stream.\n\nOBJECTIVE: Use `LEAD(stability) OVER (ORDER BY time_tick)` to see the future stability value alongside the current one.",
            objective: "Look ahead. `SELECT time_tick, stability, LEAD(stability) OVER (ORDER BY time_tick) FROM readings`.",
            hint: "LEAD() accesses data from the next row in the window.",
            table: {
                name: "readings",
                columns: [{ name: "time_tick", type: "number" }, { name: "stability", type: "string" }],
                data: [
                    { time_tick: 1, stability: "Stable" },
                    { time_tick: 2, stability: "Shaking" },
                    { time_tick: 3, stability: "COLLAPSE" }
                ]
            },
            expectedResult: (data) => {
                const shaking = data[1];
                const leadKey = Object.keys(shaking).find(k => k.includes("LEAD"));
                return shaking.stability === "Shaking" && shaking[leadKey!] === "COLLAPSE";
            },
            successMessage: "PREDICTION CONFIRMED. Evasive maneuvers initialized."
        },

        // --- QUEST 4: RESTORE TOTALS (RUNNING SUM) ---
        {
            id: "Q4_TOTALS",
            title: "RESTORE HISTORY",
            story: "ZERO: History is fragmented. The cumulative data is gone.\nNYX: We need to rebuild the timeline of energy growth. Calculate the running total of energy over time.\n\nOBJECTIVE: Use `SUM(energy) OVER (ORDER BY year)` to calculate the cumulative energy.",
            objective: "Rebuild history. `SELECT year, energy, SUM(energy) OVER (ORDER BY year) FROM history`.",
            hint: "SUM() with an ORDER BY clause inside OVER() creates a running total.",
            table: {
                name: "history",
                columns: [{ name: "year", type: "number" }, { name: "energy", type: "number" }],
                data: [
                    { year: 2020, energy: 10 },
                    { year: 2021, energy: 20 },
                    { year: 2022, energy: 30 }
                ]
            },
            expectedResult: (data) => {
                const last = data[2]; // 2022
                const sumKey = Object.keys(last).find(k => k.includes("SUM"));
                // Total should be 10+20+30 = 60
                return last[sumKey!] === 60;
            },
            successMessage: "HISTORY RESTORED. The timeline is solidifying."
        },

        // --- BOSS: TIME WARDEN ---
        {
            id: "BOSS_WARDEN",
            title: "FINAL BOSS: TIME WARDEN",
            story: "WARNING: TEMPORAL ANOMALY.\n\nThe Time Warden is shifting ranks! He attacks the entity with the highest power rank in each zone.\n\nSTRATEGY: You need to identify the rank of each power signature within its zone.\n\nOBJECTIVE: `SELECT *, RANK() OVER (PARTITION BY zone ORDER BY power DESC) FROM signatures`.",
            objective: "Rank the threats. Use RANK(), partition by zone, order by power DESC.",
            hint: "PARTITION BY groups the ranking. ORDER BY determines the rank within that group.",
            table: {
                name: "signatures",
                columns: [{ name: "id", type: "number" }, { name: "zone", type: "string" }, { name: "power", type: "number" }],
                data: [
                    { id: 1, zone: "Alpha", power: 5000 },
                    { id: 2, zone: "Alpha", power: 8000 }, // Rank 1 in Alpha
                    { id: 3, zone: "Beta", power: 1000 },
                    { id: 4, zone: "Beta", power: 9000 }  // Rank 1 in Beta
                ]
            },
            expectedResult: (data) => {
                const alphaHigh = data.find(d => d.id === 2);
                const betaHigh = data.find(d => d.id === 4);
                const rankKey = Object.keys(data[0]).find(k => k.includes("RANK"));
                return alphaHigh[rankKey!] === 1 && betaHigh[rankKey!] === 1;
            },
            successMessage: "WARDEN DEFEATED. The Time Labyrinth has aligned.\n\nZERO: 'I can see... everything. Past, present, future.'\n\nABILITY UNLOCKED: CHRONO-READER."
        }
    ]
};

export const LEVEL_7: LevelData = {
    id: 7,
    title: "THE VAULT OF STABILITY",
    description: "The core of reality's persistence. Maintain ACID properties to prevent corruption.",
    theme: ThemeStyle.VAULT,
    missions: [
        // --- QUEST 1: SEAL BROKEN WRITES (ATOMICITY) ---
        {
            id: "Q1_ATOMICITY",
            title: "SEAL BROKEN WRITES",
            story: "ZERO: This vault... it feels heavy. Like the air is made of glass.\nNYX: This is where changes are made permanent. But some transactions crashed halfway. We have 'Pending' writes that never committed.\n\nOBJECTIVE: Find all transaction logs that are still in 'Pending' state to identify the rollback targets.",
            objective: "Identify loose ends. `SELECT * FROM transaction_log WHERE state = 'Pending'`.",
            hint: "Atomicity means all or nothing. Pending states are dangerous.",
            table: {
                name: "transaction_log",
                columns: [{ name: "tx_id", type: "number" }, { name: "operation", type: "string" }, { name: "state", type: "string" }],
                data: [
                    { tx_id: 101, operation: "Update_World_A", state: "Committed" },
                    { tx_id: 102, operation: "Delete_Void", state: "Pending" }, // Target
                    { tx_id: 103, operation: "Insert_Hero", state: "Committed" }
                ]
            },
            expectedResult: (data) => data.length === 1 && data[0].tx_id === 102,
            successMessage: "PARTIAL STATES ROLLED BACK. The pillars are solid again."
        },

        // --- QUEST 2: PURGE CONFLICTS (CONCURRENCY) ---
        {
            id: "Q2_CONFLICTS",
            title: "PURGE CONFLICTS",
            story: "PIXEL: Two processes are fighting over the same data block! It's a race condition.\nZERO: I see the sparks. They are targeting the same ID.\n\nOBJECTIVE: Find the conflicting processes. Join the 'active_processes' table to itself to find two DIFFERENT process IDs that target the SAME 'target_block'.",
            objective: "Detect race condition. `SELECT p1.pid AS pid1, p2.pid AS pid2 FROM active_processes AS p1 JOIN active_processes AS p2 ON p1.target_block = p2.target_block WHERE p1.pid <> p2.pid`.",
            hint: "Use aliases (AS p1, AS p2) to join a table to itself.",
            table: {
                name: "active_processes",
                columns: [{ name: "pid", type: "number" }, { name: "target_block", type: "string" }],
                data: [
                    { pid: 1, target_block: "Block_A" },
                    { pid: 2, target_block: "Block_B" },
                    { pid: 3, target_block: "Block_A" } // Conflict with 1
                ]
            },
            expectedResult: (data) => data.length >= 2, // Should find 1-3 and 3-1
            successMessage: "CONFLICT RESOLVED. Priority assigned to Process 1."
        },

        // --- QUEST 3: REPAIR OVERLAPS (DIRTY READS) ---
        {
            id: "Q3_DIRTY_READ",
            title: "REPAIR OVERLAPS",
            story: "NYX: Someone is reading data that hasn't been committed yet. It's a Dirty Read.\nPIXEL: The 'isolation_level' is set too low on these sessions.\n\nOBJECTIVE: Identify sessions running with 'READ_UNCOMMITTED'. They are the source of the corruption.",
            objective: "Enforce isolation. `SELECT * FROM db_sessions WHERE isolation_level = 'READ_UNCOMMITTED'`.",
            hint: "Higher isolation levels prevent dirty reads.",
            table: {
                name: "db_sessions",
                columns: [{ name: "session_id", type: "number" }, { name: "user", type: "string" }, { name: "isolation_level", type: "string" }],
                data: [
                    { session_id: 1, user: "Admin", isolation_level: "SERIALIZABLE" },
                    { session_id: 2, user: "Guest", isolation_level: "READ_UNCOMMITTED" }, // Target
                    { session_id: 3, user: "Bot", isolation_level: "READ_COMMITTED" }
                ]
            },
            expectedResult: (data) => data.length === 1 && data[0].session_id === 2,
            successMessage: "ISOLATION SHIELDS RESTORED. No more leaking data."
        },

        // --- MINI-BOSS: DEADLOCK HYDRA ---
        {
            id: "BOSS_DEADLOCK",
            title: "MINI-BOSS: DEADLOCK HYDRA",
            story: "ALERT: DEADLOCK DETECTED.\n\nThe Hydra has two heads. Head A waits for Resource B. Head B waits for Resource A. They are stuck forever.\n\nOBJECTIVE: Detect the cycle! Find the pair of locks where Process 1 waits for Process 2 AND Process 2 waits for Process 1.",
            objective: "Break the cycle. `SELECT l1.process_id AS p1, l2.process_id AS p2 FROM locks AS l1 JOIN locks AS l2 ON l1.waiting_for = l2.process_id AND l2.waiting_for = l1.process_id`.",
            hint: "Join the locks table to itself. Match 'waiting_for' to 'process_id' in both directions.",
            table: {
                name: "locks",
                columns: [{ name: "process_id", type: "number" }, { name: "waiting_for", type: "number" }],
                data: [
                    { process_id: 10, waiting_for: 20 }, // 10 waits for 20
                    { process_id: 20, waiting_for: 10 }, // 20 waits for 10 (Cycle!)
                    { process_id: 30, waiting_for: 40 },
                    { process_id: 40, waiting_for: null }
                ]
            },
            expectedResult: (data) => data.length >= 1, // Should return the pair
            successMessage: "CYCLE SHATTERED. The Hydra collapses as the resources are freed."
        },

        // --- FINAL BOSS: TRANSACTION OVERLORD ---
        {
            id: "BOSS_OVERLORD",
            title: "FINAL BOSS: TRANSACTION OVERLORD",
            story: "WARNING: MASTER LOG CORRUPTION.\n\nThe Overlord is overwriting the history of the universe. It's inserting 'Phantom' entries that shouldn't exist.\n\nSTRATEGY: You must validate the log.\n1. Find entries where the 'checksum' is NULL (Integrity Failure).\n2. OR entries where the 'status' is 'Rolled_Back' but they are still visible.",
            objective: "Purge the Log. `SELECT * FROM master_log WHERE checksum IS NULL OR status = 'Rolled_Back'`.",
            hint: "Use OR to combine the two failure conditions.",
            table: {
                name: "master_log",
                columns: [{ name: "entry_id", type: "number" }, { name: "status", type: "string" }, { name: "checksum", type: "string" }],
                data: [
                    { entry_id: 1, status: "Committed", checksum: "0xAF" },
                    { entry_id: 2, status: "Committed", checksum: null }, // Target (Integrity fail)
                    { entry_id: 3, status: "Rolled_Back", checksum: "0x00" }, // Target (Should not be visible)
                    { entry_id: 4, status: "Committed", checksum: "0xFF" }
                ]
            },
            expectedResult: (data) => data.length === 2,
            successMessage: "CONSISTENCY RESTORED. The Vault is stable. \n\nZERO: 'I control the flow of change itself now.'\n\nABILITY UNLOCKED: REALITY STABILIZER."
        }
    ]
};
