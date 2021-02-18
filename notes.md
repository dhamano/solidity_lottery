# the 'msg' Global Variable
-------------------------------------------------------------------
|   msg.data   |  'Data' field from the call or tansaction that   |
|              |  invoked the current function                    |
-------------------------------------------------------------------
|   msg.gas    |  Amount of gas the current function invocation   |
|              |  has available                                   |
-------------------------------------------------------------------
|   msg.sender |  Address of the account that started the current |
|              |  function invocation                             |
-------------------------------------------------------------------
|   msg.value  |  Amount of ether (in wei) that was sent along    |
|              |  with the function invocation                    |
-------------------------------------------------------------------

# Solidity Types

## Basic Types
string          - sequence of chars
bool            - boolean
int             - integer, pos or neg, whole number
uint            - unsigned int, alway positive, whole number
fixed/ufixed    - 'fixed' point number. number with decimal after it
address         - has methods tied to it for sending money

__int__
int8    = 8 bit int (-128 — 127)
int16   = 16 bit int (-32,768 - 32,767)
int32   = 32 bit int (-2,147,482,648 - 2,147,483,647)
...
int256  = largest number

int     = alias for __int256__

__uint__
uint8   = unsigned 8bit int (0 - 255)
uint16  = (0 - 65,535)
uint32  = (0 - 4,294,967,295)
...
uint256

uint    = alis for __uint256__

## Reference Types
_for public arrays, the default getter function created requires the index of the array value you want returned_

fixed array     = array that contains a single type of element. Has an unchanging length
```
    int[3] // creates an array of length 3 [1, 2, 3]
```
dynamic array   = array that contains a single type of element. can change in size over time
```
    int[]
```
mapping         = collection of key value pairs. _think of JS objects, Ruby hashes, or Python dict._
                  all keys must be the same type, and all values must be of the same type. used to store a collection of things.
```
    maping(string => string)
    maping(int => bool)
```
struct          = collection of key value pairs that can have different types. usually used to represent a single thing ex. house, desk, car, etc.
```
    struct Car {
        string make;
        string model;
        uint value;
    }
```

### notes
_strings_ are stored as dynamic arrays in solidity
an _array_ of _dynamic arrays_ cannot be used in ABI/JS/WEB3 world