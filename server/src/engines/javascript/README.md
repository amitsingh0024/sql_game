# JavaScript Engine Implementation

## Overview

The JavaScript engine executes JavaScript code using Node.js's built-in `vm` module, providing a sandboxed execution environment without the need for compilation or external processes.

## Features

✅ **Sandboxed Execution:**
- Uses Node.js VM module
- Isolated execution context
- No file system access
- No network access
- No system calls

✅ **Security:**
- Blocks dangerous require() calls
- Blocks eval() and Function()
- Blocks process access
- Blocks file system operations
- Blocks network operations

✅ **Performance:**
- Fast execution (no compilation needed)
- Low memory overhead
- Quick startup time

## Security Restrictions

The following operations are blocked:
- File system (`require('fs')`)
- Child processes (`require('child_process')`)
- Operating system (`require('os')`)
- Network (`require('net')`, `require('http')`, `require('https')`)
- Crypto operations (`require('crypto')`)
- Path operations (`require('path')`)
- Process access (`process.*`)
- Eval operations (`eval()`, `Function()`)
- Global access (`global`, `globalThis`)
- Module system (`require`, `module`, `exports`)

## Allowed Operations

✅ **Safe Operations:**
- Math operations
- String/Array/Object manipulation
- Date operations
- JSON parsing
- Regular expressions
- Basic control flow
- Functions and closures
- Console output (captured)

## Usage

```typescript
const jsEngine = new JsEngine();

// Execute JavaScript code
const result = await jsEngine.execute(
  `function add(a, b) {
     return a + b;
   }
   console.log(add(5, 3));`,
  {
    timeout: 3000,
  }
);

// Compare with expected output
const matches = jsEngine.compareResult(result, "8\n");
```

## Code Examples

### Example 1: Basic Calculation
```javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120
```

### Example 2: Array Operations
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = doubled.reduce((a, b) => a + b, 0);
console.log(sum); // Output: 30
```

### Example 3: String Manipulation
```javascript
const text = "Hello, World!";
const reversed = text.split('').reverse().join('');
console.log(reversed); // Output: !dlroW ,olleH
```

### Example 4: Object Operations
```javascript
const person = {
  name: "John",
  age: 30,
  greet: function() {
    return `Hello, I'm ${this.name} and I'm ${this.age} years old.`;
  }
};
console.log(person.greet());
```

## Output Formatting

The engine automatically formats output:
- **Primitives:** Displayed as-is
- **Objects:** JSON stringified with indentation
- **Arrays:** JSON stringified
- **null/undefined:** Displayed as strings

## Console Output

All console methods are captured:
- `console.log()` - Standard output
- `console.error()` - Error output
- `console.warn()` - Warning output
- `console.info()` - Info output

## Error Handling

The engine handles:
- **Syntax Errors:** Detected during validation
- **Runtime Errors:** Caught during execution
- **Timeout Errors:** Execution exceeds time limit
- **Security Violations:** Blocked during validation

## Performance

- **Execution Time:** Typically < 100ms for simple code
- **Memory Usage:** Low (VM context is lightweight)
- **Startup Time:** Instant (no compilation needed)
- **Timeout:** Default 5 seconds (configurable)

## Limitations

1. **No File I/O:** Cannot read from or write to files
2. **No Network:** Cannot make HTTP requests
3. **No System Calls:** Cannot execute system commands
4. **No Native Modules:** Cannot use npm packages
5. **Limited setTimeout:** Maximum 1 second delay
6. **No Async Operations:** Limited async support (no promises by default)

## Security Notes

⚠️ **Important:** The VM module provides basic sandboxing but is not 100% secure. For production use, consider:
- Using `isolated-vm` package for stronger isolation
- Docker containers for complete isolation
- Resource limits (CPU, memory)
- Process sandboxing

## Future Enhancements

1. **Promise Support:** Add Promise support for async operations
2. **Better Sandboxing:** Use `isolated-vm` for stronger isolation
3. **Resource Monitoring:** Track CPU and memory usage
4. **Async/Await Support:** Full async/await support
5. **Module System:** Limited module support (with security)

## Troubleshooting

### Syntax Errors
**Error:** `JavaScript syntax error: ...`

**Solution:** Check code syntax, ensure valid JavaScript

### Timeout Errors
**Error:** `Execution timeout`

**Solution:** Optimize code or increase timeout

### Security Violations
**Error:** `Dangerous operation detected`

**Solution:** Remove blocked operations from code

## Comparison with Other Engines

| Feature | JavaScript | C++ | SQL |
|---------|-----------|-----|-----|
| Compilation | No | Yes | No |
| Execution Speed | Fast | Medium | Fast |
| Memory Usage | Low | Medium | Low |
| Setup Required | None | g++ compiler | Database |
| Sandboxing | VM module | Process isolation | Query restrictions |

## Best Practices

1. **Keep code simple:** Avoid complex operations
2. **Use console.log:** For output display
3. **Return values:** Code can return values
4. **Handle errors:** Use try-catch for error handling
5. **Test locally:** Test code before submission

