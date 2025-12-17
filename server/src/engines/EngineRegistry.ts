/**
 * Engine Registry
 * 
 * Central registry for all code execution engines
 * Implements singleton pattern for global access
 */

import { ICodeEngine } from './types.js';
import { SqlEngine } from './sql/SqlEngine.js';
import { CppEngine } from './cpp/CppEngine.js';
import { JsEngine } from './javascript/JsEngine.js';
import logger from '../utils/logger.js';

class EngineRegistry {
  private static instance: EngineRegistry;
  private engines: Map<string, ICodeEngine> = new Map();

  private constructor() {
    this.registerDefaultEngines();
  }

  public static getInstance(): EngineRegistry {
    if (!EngineRegistry.instance) {
      EngineRegistry.instance = new EngineRegistry();
    }
    return EngineRegistry.instance;
  }

  /**
   * Register default engines
   */
  private registerDefaultEngines(): void {
    // Register SQL engine
    const sqlEngine = new SqlEngine();
    this.register('SQL', sqlEngine);
    
    // Register C++ engine
    const cppEngine = new CppEngine();
    this.register('C++', cppEngine);
    
    // Register JavaScript engine
    const jsEngine = new JsEngine();
    this.register('JAVASCRIPT', jsEngine);
    
    logger.info('✅ Engine Registry initialized with SQL, C++, and JavaScript engines');
  }

  /**
   * Register an engine
   */
  public register(language: string, engine: ICodeEngine): void {
    const normalizedLanguage = language.toUpperCase();
    this.engines.set(normalizedLanguage, engine);
    logger.info(`Registered ${normalizedLanguage} engine`);
  }

  /**
   * Get an engine by language
   */
  public get(language: string): ICodeEngine | null {
    const normalizedLanguage = language.toUpperCase();
    return this.engines.get(normalizedLanguage) || null;
  }

  /**
   * Check if an engine is registered
   */
  public has(language: string): boolean {
    const normalizedLanguage = language.toUpperCase();
    return this.engines.has(normalizedLanguage);
  }

  /**
   * Get all registered languages
   */
  public getLanguages(): string[] {
    return Array.from(this.engines.keys());
  }

  /**
   * Get all engines
   */
  public getAllEngines(): Map<string, ICodeEngine> {
    return new Map(this.engines);
  }

  /**
   * Unregister an engine
   */
  public unregister(language: string): boolean {
    const normalizedLanguage = language.toUpperCase();
    const removed = this.engines.delete(normalizedLanguage);
    if (removed) {
      logger.info(`Unregistered ${normalizedLanguage} engine`);
    }
    return removed;
  }

  /**
   * Clear all engines
   */
  public clear(): void {
    this.engines.clear();
    logger.info('All engines cleared');
  }
}

export default EngineRegistry.getInstance();

