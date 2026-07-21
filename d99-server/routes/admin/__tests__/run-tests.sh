#!/bin/bash

# BetLock Routes - Test Runner Script
# Usage: ./run-tests.sh [option]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}! $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

run_unit_tests() {
    print_header "Running Unit Tests"
    npm test -- routes/admin/__tests__/betLockRoutes.test.js --verbose || {
        print_error "Unit tests failed"
        return 1
    }
    print_success "Unit tests passed"
}

run_integration_tests() {
    print_header "Running Integration Tests"
    npm test -- routes/admin/__tests__/betLockRoutes.integration.test.js --verbose || {
        print_error "Integration tests failed"
        return 1
    }
    print_success "Integration tests passed"
}

run_all_tests() {
    print_header "Running All Tests"
    npm test -- routes/admin/__tests__/ --verbose || {
        print_error "Some tests failed"
        return 1
    }
    print_success "All tests passed"
}

run_with_coverage() {
    print_header "Running Tests with Coverage"
    npm test -- routes/admin/__tests__/ --coverage || {
        print_error "Coverage report generation failed"
        return 1
    }
    print_success "Coverage report generated"
}

run_specific_test() {
    local pattern=$1
    print_header "Running Tests Matching: $pattern"
    npm test -- routes/admin/__tests__/ -t "$pattern" --verbose || {
        print_error "Test execution failed"
        return 1
    }
    print_success "Tests passed"
}

show_help() {
    cat << EOF
${BLUE}BetLock Routes - Test Runner${NC}

${YELLOW}Usage:${NC}
  ./run-tests.sh [option]

${YELLOW}Options:${NC}
  unit              Run only unit tests
  integration       Run only integration tests
  all               Run all tests (default)
  coverage          Run tests with coverage report
  watch             Run tests in watch mode
  specific [name]   Run tests matching a specific name
  quick             Run quick validation (unit tests only)
  help              Show this help message

${YELLOW}Examples:${NC}
  ./run-tests.sh unit
  ./run-tests.sh integration
  ./run-tests.sh specific "lock multiple"
  ./run-tests.sh coverage
  ./run-tests.sh watch

${YELLOW}Test Files:${NC}
  - betLockRoutes.test.js              (30+ unit tests)
  - betLockRoutes.integration.test.js  (8 real-world scenarios)

${YELLOW}Documentation:${NC}
  - README.md                          (Complete guide)
  - QUICK_REFERENCE.md                 (Commands reference)
  - BETLOCK_TESTING_GUIDE.md           (Manual testing)
  - BetLock_Postman_Collection.json    (Postman requests)

EOF
}

# Main script
main() {
    local option=${1:-all}

    case $option in
        unit)
            run_unit_tests
            ;;
        integration)
            run_integration_tests
            ;;
        all)
            run_unit_tests
            run_integration_tests
            ;;
        coverage)
            run_with_coverage
            ;;
        watch)
            print_header "Running Tests in Watch Mode"
            npm test -- routes/admin/__tests__/ --watch
            ;;
        specific)
            if [ -z "$2" ]; then
                print_error "Please provide a test name pattern"
                echo "Usage: ./run-tests.sh specific [name]"
                exit 1
            fi
            run_specific_test "$2"
            ;;
        quick)
            print_info "Running quick validation..."
            run_unit_tests
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown option: $option"
            echo ""
            show_help
            exit 1
            ;;
    esac

    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_header "Test Run Completed Successfully"
        echo -e "${GREEN}All tests passed!${NC}\n"
    else
        print_header "Test Run Failed"
        echo -e "${RED}Some tests failed. Please review the output above.${NC}\n"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
