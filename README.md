# Hayloft

UI tool for LLM frameworks to make easy prompt/completion tracking, store and comparison of different sessions.

Install package with pip

```
pip install hayloft
```
### Usage for BabyAGI

https://github.com/eturchenkov/hayloft/assets/49445761/bdbd11c2-ff94-4ab0-b664-bba0cf3d2b7b

Clone BabyAGI fork repo, setup virtual env and install all dependencies.

```
git clone git@github.com:eturchenkov/babyagi-hayloft.git
cd babyagi-hayloft
python -m venv .
source ./bin/activate
pip install -r requirements.txt
```

Adjust config in .env file. 

Start hayloft server.

```
hayloft start
```

Go to browser and open [http://localhost:7000](http://localhost:7000). Start babyagi.py script.

```
python babyagi.py
```

Go to back to browser and select first session from session list that is stream session of current BabyAGI execution. All session stored and you can explore them at any time.
