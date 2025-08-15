// Minimal curriculum (expandable). Each module has lessons with content and examples.
window.CURRICULUM = [
  {
    id: 'foundations',
    title: 'Foundations',
    description: 'Start from zero: syntax, variables, types, control flow, functions.',
    lessons: [
      {
        id: 'intro',
        title: 'Intro to Python',
        content: `Python is a general-purpose language known for readability.
Install Python from python.org or use an online REPL.
Run code with the interpreter: 
- REPL: type \`python\`
- Script: \`python your_script.py\`
Good practice: use a virtual environment (\`python -m venv .venv\`).`,
        example: `print("Hello, Sensei!")`
      },
      {
        id: 'variables',
        title: 'Variables & Types',
        content: `Variables are names bound to values. Types: int, float, bool, str, list, tuple, set, dict.`,
        example: `age = 21
pi = 3.14
is_ok = True
name = "Ada"
print(type(age), type(name))`
      },
      {
        id: 'control-flow',
        title: 'Control Flow',
        content: `Use if/elif/else and loops to control execution.`,
        example: `n = 7
if n % 2 == 0:
    print("even")
else:
    print("odd")
for i in range(3):
    print(i)`
      },
      {
        id: 'functions',
        title: 'Functions',
        content: `Functions encapsulate logic and return values.`,
        example: `def greet(name: str) -> str:
    return f"Hello, {name}"
print(greet("Sensei"))`
      }
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Data structures, strings, files, exceptions, modules, OOP basics.',
    lessons: [
      { id:'lists-dicts', title:'Lists & Dicts', content:'Collections for sequences and mappings.', example:'nums=[1,2,3]; user={"name":"Dee","age":24}
nums.append(4)
print(nums,user["name"])' },
      { id:'files', title:'File I/O', content:'Reading and writing text files.', example:'with open("notes.txt","w") as f:
    f.write("hello")
with open("notes.txt") as f:
    print(f.read())' },
      { id:'exceptions', title:'Exceptions', content:'Handle errors gracefully.', example:'try:
    x=1/0
except ZeroDivisionError:
    print("nope")
finally:
    print("done")' }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Decorators, generators, OOP, async, testing.',
    lessons: [
      { id:'decorators', title:'Decorators', content:'Functions that wrap functions.', example:'def log(fn):
    def inner(*a,**k):
        print("calling",fn.__name__)
        return fn(*a,**k)
    return inner
@log
def add(a,b): return a+b
print(add(2,3))' },
      { id:'generators', title:'Generators', content:'Lazy sequences with yield.', example:'def countdown(n):
    while n>0:
        yield n
        n-=1
print(list(countdown(5)))' }
    ]
  }
];
