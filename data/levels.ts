import { LevelData, ThemeStyle } from '../types';

export const LEVEL_1: LevelData = {
  id: 1,
  title: "DATA DISTRICT",
  description: "The logic core. Shadows are displacing citizens and time is de-synced.",
  theme: ThemeStyle.CYBERPUNK,
  missions: [
    // ... (Keep existing missions)
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
    // ... (Rest of Level 1 missions)
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
          { id: 2, behavior: "Erratic", visual_stability: 20 },
          { id: 3, behavior: "Erratic", visual_stability: 90 },
          { id: 4, behavior: "Calm", visual_stability: 10 }
        ]
      },
      expectedResult: (data) => data.length === 1 && data[0].id === 2,
      successMessage: "TARGET LOCKED. You caught them right before they multiplied."
    },
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
          { clone_id: 4, appearance: "Viper", soul_signature: "REAL_ONE" },
          { clone_id: 5, appearance: "Viper", soul_signature: "FAKE_01" }
        ]
      },
      expectedResult: (data) => {
        return data.length === 2 && data.some(d => d.soul_signature === 'REAL_ONE');
      },
      successMessage: "ILLUSION SHATTERED. The clones have evaporated. Only the real glitch remains... and it's running away."
    },
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
          { node_id: "CORE_EYE", type: "Critical", stability: 10 },
          { node_id: "CORE_HEART", type: "Critical", stability: 50 },
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

// ... (Levels 2-11 assumed present)
export const LEVEL_2: LevelData = { id: 2, title: "LINK CITY", description: "", theme: ThemeStyle.VAPORWAVE, missions: [] };
export const LEVEL_3: LevelData = { id: 3, title: "MARKETVERSE", description: "", theme: ThemeStyle.CYBERPUNK, missions: [] };
export const LEVEL_4: LevelData = { id: 4, title: "CENSUS CORE", description: "", theme: ThemeStyle.BLUEPRINT, missions: [] };
export const LEVEL_5: LevelData = { id: 5, title: "WARPSPACE", description: "", theme: ThemeStyle.FRACTAL, missions: [] };
export const LEVEL_6: LevelData = { id: 6, title: "TIME LABYRINTH", description: "", theme: ThemeStyle.CHRONO, missions: [] };
export const LEVEL_7: LevelData = { id: 7, title: "THE VAULT", description: "", theme: ThemeStyle.VAULT, missions: [] };
export const LEVEL_8: LevelData = { id: 8, title: "DRAGON MACHINE", description: "", theme: ThemeStyle.DRAGON, missions: [] };
export const LEVEL_9: LevelData = { id: 9, title: "UNDERWORLD KERNEL", description: "", theme: ThemeStyle.KERNEL, missions: [] };
export const LEVEL_10: LevelData = { id: 10, title: "SHATTERED UNIVERSES", description: "", theme: ThemeStyle.SHARD, missions: [] };
export const LEVEL_11: LevelData = { id: 11, title: "THE GLITCHVERSE CORE", description: "", theme: ThemeStyle.CORE, missions: [] };

export const LEVEL_12: LevelData = {
    id: 12,
    title: "THE ARCHITECT'S HALL",
    description: "The infinite white void. Rewrite reality from scratch.",
    theme: ThemeStyle.ARCHITECT,
    missions: [
        // --- QUEST 1: DEFINE FOUNDATIONS (METADATA) ---
        {
            id: "Q1_FOUNDATION",
            title: "DEFINE FOUNDATIONS",
            story: "ZERO: It's... empty. Just infinite white.\nNYX: This is where schemas are born. We need to clear out the old, broken blueprints.\n\nOBJECTIVE: Find the deprecated schemas. Select the 'table_name' from 'schema_blueprints' where 'status' is 'DEPRECATED'.",
            objective: "Clean the slate. `SELECT table_name FROM schema_blueprints WHERE status = 'DEPRECATED'`.",
            hint: "Metadata tables hold the rules for other tables. Filter them like any other data.",
            table: {
                name: "schema_blueprints",
                columns: [{ name: "blueprint_id", type: "number" }, { name: "table_name", type: "string" }, { name: "status", type: "string" }],
                data: [
                    { blueprint_id: 1, table_name: "users_v1", status: "DEPRECATED" },
                    { blueprint_id: 2, table_name: "users_v2", status: "ACTIVE" },
                    { blueprint_id: 3, table_name: "legacy_logs", status: "DEPRECATED" }
                ]
            },
            expectedResult: (data) => data.length === 2 && data.some(d => d.table_name === "users_v1"),
            successMessage: "BLUEPRINTS CLEARED. The foundation is ready for new structures."
        },

        // --- QUEST 2: MULTI-MODEL REALITY (HYBRID DATA) ---
        {
            id: "Q2_MULTIMODEL",
            title: "SHAPE MULTI-MODEL REALITY",
            story: "PIXEL: Some worlds don't fit into rows and columns. They're... web-like.\nNYX: Graph structures. We need to find the specific worlds that require graph logic or document storage.\n\nOBJECTIVE: Identify the complex worlds. Select all records from 'world_requirements' where 'data_structure' is 'Graph' OR 'data_structure' is 'Document'.",
            objective: "Map the complexity. `SELECT * FROM world_requirements WHERE data_structure = 'Graph' OR data_structure = 'Document'`.",
            hint: "Use OR to select multiple types of non-relational structures.",
            table: {
                name: "world_requirements",
                columns: [{ name: "world_id", type: "number" }, { name: "data_structure", type: "string" }, { name: "complexity", type: "string" }],
                data: [
                    { world_id: 101, data_structure: "Relational", complexity: "Low" },
                    { world_id: 102, data_structure: "Graph", complexity: "High" }, // Target
                    { world_id: 103, data_structure: "Document", complexity: "Medium" } // Target
                ]
            },
            expectedResult: (data) => data.length === 2 && data.some(d => d.data_structure === "Graph"),
            successMessage: "MODELS INTEGRATED. The Glitchverse can now support any form of data."
        },

        // --- QUEST 3: EVOLVE SCHEMA (VERSIONING) ---
        {
            id: "Q3_EVOLVE",
            title: "EVOLVE THE SCHEMA",
            story: "ZERO: New worlds are forming, but they are clashing with old ones.\nNYX: We need to manage the evolution. Always pick the latest version of the world definition.\n\nOBJECTIVE: For each 'world_name', find the maximum 'version' number to ensure we use the latest update.",
            objective: "Update Reality. `SELECT world_name, MAX(version) FROM world_versions GROUP BY world_name`.",
            hint: "Grouping by name and taking MAX(version) ensures we ignore outdated iterations.",
            table: {
                name: "world_versions",
                columns: [{ name: "world_name", type: "string" }, { name: "version", type: "number" }, { name: "status", type: "string" }],
                data: [
                    { world_name: "Neo_Tokyo", version: 1, status: "Legacy" },
                    { world_name: "Neo_Tokyo", version: 2, status: "Active" },
                    { world_name: "Atlantis", version: 5, status: "Active" }
                ]
            },
            expectedResult: (data) => data.length === 2 && data.find(d => d.world_name === "Neo_Tokyo")?.['MAX(version)'] === 2,
            successMessage: "EVOLUTION COMPLETE. Reality is updating smoothly."
        },

        // --- QUEST 4: AUTONOMOUS REPAIR (TRIGGERS) ---
        {
            id: "Q4_SELF_HEAL",
            title: "CREATE AUTO-REPAIR",
            story: "NYX: You won't always be here to fix things, Zero. We need to build a system that fixes itself.\nPIXEL: Automated Triggers! If a 'CORRUPTION' event happens, the system should catch it.\n\nOBJECTIVE: Activate the defense protocols. Select 'rule_id' from 'auto_repair_logic' where 'trigger_event' is 'CORRUPTION'.",
            objective: "Automate Defense. `SELECT rule_id FROM auto_repair_logic WHERE trigger_event = 'CORRUPTION'`.",
            hint: "Selecting these rules effectively 'turns them on' in the Architect's console.",
            table: {
                name: "auto_repair_logic",
                columns: [{ name: "rule_id", type: "string" }, { name: "trigger_event", type: "string" }, { name: "action", type: "string" }],
                data: [
                    { rule_id: "RULE_01", trigger_event: "LATENCY", action: "SCALE_UP" },
                    { rule_id: "RULE_02", trigger_event: "CORRUPTION", action: "ROLLBACK" }, // Target
                    { rule_id: "RULE_03", trigger_event: "CORRUPTION", action: "ISOLATE" } // Target
                ]
            },
            expectedResult: (data) => data.length === 2,
            successMessage: "SYSTEM IS SELF-HEALING. VEX can never return."
        },

        // --- BOSS: ZERO'S PAST SELF ---
        {
            id: "BOSS_ZERO_ECHO",
            title: "FINAL BOSS: ZERO'S ECHO",
            story: "THE REFLECTION: 'Why struggle? Chaos is natural. Structure is a prison.'\n\nZERO: 'No. Structure is what lets us exist.'\n\nSTRATEGY: Prove your mastery. Combine the 'Knowledge' of the past with the 'Wisdom' of the future to create the Golden Path. \n1. Select 'value' and 'clarity' from BOTH tables.\n2. Filter for clarity > 80.\n3. UNION them together.\n4. Order by 'clarity' DESC.",
            objective: "Synthesize the timeline. `SELECT value, clarity FROM past_knowledge WHERE clarity > 80 UNION SELECT value, clarity FROM future_wisdom WHERE clarity > 80 ORDER BY clarity DESC`.",
            hint: "Use UNION to combine the tables, then ORDER BY to prioritize the clearest truths.",
            tables: [
                {
                    name: "past_knowledge",
                    columns: [{ name: "id", type: "number" }, { name: "value", type: "string" }, { name: "clarity", type: "number" }],
                    data: [
                        { id: 1, value: "Learned SQL", clarity: 50 },
                        { id: 2, value: "Defeated VEX", clarity: 90 }
                    ]
                },
                {
                    name: "future_wisdom",
                    columns: [{ name: "id", type: "number" }, { name: "value", type: "string" }, { name: "clarity", type: "number" }],
                    data: [
                        { id: 1, value: "Became Architect", clarity: 100 },
                        { id: 2, value: "Forgot Syntax", clarity: 10 }
                    ]
                }
            ],
            expectedResult: (data) => {
                if (data.length !== 2) return false;
                // Check order
                return data[0].clarity === 100 && data[1].clarity === 90;
            },
            successMessage: "THE ECHO FADES. You are whole. \n\nNYX: 'You are the Architect now.'\n\nCONGRATULATIONS. YOU HAVE BEATEN THE GAME."
        }
    ]
};
