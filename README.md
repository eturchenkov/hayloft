# Hayloft 

[![Downloads](https://static.pepy.tech/badge/hayloft/month)](https://pepy.tech/project/hayloft)
[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/eaturchenkov.svg?style=social&label=Follow%20%40eaturchenkov)](https://twitter.com/eaturchenkov)

UI tool for LLM frameworks to make easy prompt/completion tracking, store and comparison of different sessions.

Install package with pip
```
pip install hayloft
```
### Usage for LlamaIndex

https://github.com/eturchenkov/hayloft/assets/49445761/ee537ed1-1a97-454d-9d11-7a494c1b2ba5

Install llama_index and hayloft packages, create ```example.py``` file as below. Put [examples](https://github.com/jerryjliu/llama_index/tree/main/examples) folder from llama_index repo near the file.
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
Start hayloft server
```
hayloft start
```
Start this script
```
python example.py
```
Trace logs of your script on [http://localhost:7000](http://localhost:7000)

### Usage for BabyAGI

https://github.com/eturchenkov/hayloft/assets/49445761/bdbd11c2-ff94-4ab0-b664-bba0cf3d2b7b

Clone BabyAGI fork repo, setup virtual env and install all dependencies

```
git clone git@github.com:eturchenkov/babyagi-hayloft.git
cd babyagi-hayloft
python -m venv .
source ./bin/activate
pip install -r requirements.txt
```
Adjust config in .env file and start hayloft server
```
hayloft start
```
Go to browser and open [http://localhost:7000](http://localhost:7000) and start babyagi.py script
```
python babyagi.py
```
Go to back to browser and select first session from session list that is stream session of current BabyAGI execution. All sessions will be stored and you can explore them at any time.
