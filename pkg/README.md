# Hayloft 

[![Downloads](https://static.pepy.tech/badge/hayloft/month)](https://pepy.tech/project/hayloft)
[![](https://dcbadge.vercel.app/api/server/EKewT5cYMy?compact=true&style=flat)](https://discord.gg/EKewT5cYMy)
[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/eaturchenkov.svg?style=social&label=Follow%20%40eaturchenkov)](https://twitter.com/eaturchenkov)

UI tool for LLM frameworks to make easy prompt/completion tracking, store and comparison of different sessions.

- [Installation](#installation)
- [Usage](#usage)
  - [LlamaIndex](#llamaindex)
  - [BabyAGI](#babyagi)

## Installation

Install package with pip
```
pip install hayloft
```

## Usage

Start hayloft server

```
hayloft start
```

Trace logs of your script on [http://localhost:7000](http://localhost:7000)

### LlamaIndex

Install `llama-index`, create `example.py` file as below. Put [examples](https://github.com/jerryjliu/llama_index/tree/main/examples) folder from llama_index repo near the file.

```python
import os
os.environ["OPENAI_API_KEY"] = 'YOUR_OPENAI_API_KEY'

from llama_index import SimpleDirectoryReader, VectorStoreIndex 
from hayloft.llama_index import grab_logs

grab_logs()

documents = SimpleDirectoryReader("examples/paul_graham_essay/data").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
query_engine.query("What did the author do growing up?")
```

Or you can start live sessions from hayloft ui, just modify code like here

```python
import os
os.environ["OPENAI_API_KEY"] = 'YOUR_OPENAI_API_KEY'

from llama_index import SimpleDirectoryReader, VectorStoreIndex 
from hayloft.llama_index import listen

def agent(query: str):
    documents = SimpleDirectoryReader("examples/paul_graham_essay/data").load_data()
    index = VectorStoreIndex.from_documents(documents)
    query_engine = index.as_query_engine()
    query_engine.query(query)

listen(agent)
```

Start this script

```
python example.py
```

### BabyAGI

Clone `BabyAGI fork` repo, setup virtual env and install all dependencies

```
git clone git@github.com:eturchenkov/babyagi-hayloft.git && cd babyagi-hayloft
pip install -r requirements.txt
```

Adjust config in .env file and start `babyagi.py` script

```
python babyagi.py
```
