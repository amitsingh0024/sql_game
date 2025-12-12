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
             {id: 101, name: "Miner"},
             {id: 102, name: "Runner"},
             {id: 103, name: "Admin"}
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
