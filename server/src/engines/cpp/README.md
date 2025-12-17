# C++ Engine Implementation

## Overview

The C++ engine compiles and executes C++ code in a sandboxed environment. It supports C++17 standard and includes security measures to prevent dangerous operations.

## Features

✅ **Code Compilation:**
- Uses g++ compiler (or clang++)
- C++17 standard
- Compilation error detection
- Automatic cleanup of compiled binaries

✅ **Security:**
- Blocks file system operations
- Blocks network operations
- Blocks system calls
- Resource limits (timeout, memory)

✅ **Cross-Platform:**
- Windows support (MinGW g++)
- Unix/Linux support
- macOS support

## Security Restrictions

The following operations are blocked:
- File I/O (`fstream`, `ofstream`, `ifstream`, `fopen`)
- System calls (`system()`, `exec()`, `fork()`, `popen()`)
- Network operations (`socket()`, `connect()`, `send()`, `recv()`)
- Dangerous headers (`sys/syscall.h`, `unistd.h`, `fcntl.h`)

## Requirements

### System Requirements
- **g++ compiler** (GNU C++ Compiler) or **clang++**
- Minimum version: C++17 support
- Available on PATH

### Installation

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install g++
```

**macOS:**
```bash
brew install gcc
```

**Windows:**
- Install MinGW-w64 or use WSL
- Ensure g++ is in PATH

## Usage

```typescript
const cppEngine = new CppEngine();

// Execute C++ code
const result = await cppEngine.execute(
  `#include <iostream>
   int main() {
     std::cout << "Hello, World!" << std::endl;
     return 0;
   }`,
  {
    timeout: 5000,
    input: "optional input",
  }
);

// Compare with expected output
const matches = cppEngine.compareResult(result, "Hello, World!\n");
```

## Code Structure Requirements

- Must contain `int main()` function
- Standard C++ libraries allowed (except restricted ones)
- No file I/O operations
- No network operations

## Example Code

```cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {3, 1, 4, 1, 5, 9, 2, 6};
    std::sort(numbers.begin(), numbers.end());
    
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;
    
    return 0;
}
```

## Limitations

1. **No File I/O:** Cannot read from or write to files
2. **No Network:** Cannot make network requests
3. **No System Calls:** Cannot execute system commands
4. **Temporary Files:** Creates temporary files during compilation (cleaned up automatically)
5. **Platform Dependent:** Requires g++/clang++ to be installed

## Error Handling

The engine handles:
- Compilation errors (syntax, missing includes, etc.)
- Runtime errors (segmentation faults, exceptions)
- Timeout errors (execution exceeds time limit)
- Resource errors (memory limits, etc.)

## Performance

- **Compilation Time:** Typically < 2 seconds for simple code
- **Execution Time:** Configurable (default 10 seconds)
- **Memory Limit:** 100MB default

## Future Enhancements

1. **Docker Support:** Run in isolated containers
2. **Resource Monitoring:** Track CPU and memory usage
3. **Better Sandboxing:** Use seccomp, namespaces, etc.
4. **Multiple Compilers:** Support for clang++, MSVC
5. **Static Analysis:** Pre-compilation code analysis

## Troubleshooting

### Compiler Not Found
**Error:** `g++: command not found`

**Solution:** Install g++ compiler and ensure it's in PATH

### Permission Denied
**Error:** `Permission denied` when executing binary

**Solution:** Ensure temp directory has write permissions

### Timeout Issues
**Error:** Execution timeout

**Solution:** Increase timeout in execution options or optimize code

## Security Notes

⚠️ **Important:** This implementation uses basic security measures. For production use, consider:
- Docker containers for isolation
- Resource limits (ulimit, cgroups)
- Network namespaces
- Read-only file systems
- Process sandboxing (seccomp, AppArmor)

