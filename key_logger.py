from profanity_check import predict_prob
import json
from pynput.keyboard import Key, Listener
import requests
from flask_cors import CORS 
from flask import Flask, request
with open(r"C:\Users\allan\Downloads\OneDrive\Self-Censorship\index.json") as read_file:
    lists_banned_words = json.load(read_file)
bannedGoogle=[]
with open(r"C:\Users\allan\Downloads\OneDrive\Self-Censorship\google.txt") as read_file:
    bannedGoogle = read_file.readlines()
for x in bannedGoogle:
    lists_banned_words[x]=1
        
banned_sentence=[]
result=dict()
keys=[]
clean_text=[]
original_words=[]
lists_banned_words=dict()
def censort(t):
    words = t.split()
    strings=""
    for idx,word in enumerate(words):
        if word in set(banned_sentence):
            censor=["*" for _ in range(len(word))]
            strings+=''.join(censor)+" "
        else:
            strings+=word+" "
    return strings

def on_press(key): 
    global keys,count,lists_banned_words
    if key==Key.space:
        text=''.join(keys)
        original_words.append(text)
        if predict_prob([text]) > 0.3 or lists_banned_words.get(text):
            banned_sentence.append(text)
        clean=censort(t=text)
        clean_text.append(clean)
        keys=[]
    else:
        print(key)
        k=str(key).replace("'", "")
        if k.isalpha():
            keys.append(k)

def on_release(key):
    global clean_text,keys,original_words,result,lists_banned_words
    try:
        if key == Key.esc:
            return False
        elif key.char=='.':#end the sentence, exit the listener
            text=''.join(keys)
            if predict_prob([text]) > 0.3 or lists_banned_words.get(text):#check again if the word of xxxx. (such as allan. beautiful.) contains profanity
                banned_sentence.append(text)
            clean=censort(t=text)
            original_words.append(''.join(keys)+key.char)
            result['before']=' '.join(original_words)
            result['after']=''.join(clean_text)+str(clean+key.char).replace(" ","")
            with open('result.json', 'w') as fp:
                json.dump(result, fp)
            
            ##CLEAN THE STATE AFTER DUMPING THE JSON##
            result=dict()
            keys=[]
            original_words=[]
            clean_text=[]
            return False
    except AttributeError:
        return True


    
app = Flask(__name__)
CORS(app)
@app.route("/censor",methods=['GET'])
def censorship():
    with Listener(on_press=on_press,on_release=on_release) as listener:
        listener.join()
    print("------------------------------------------------------------")
    with open('result.json') as f:#load sentece per sentence
        result = json.load(f)
    return {"result":result}

@app.route("/censor/delete",methods=['DELETE'])
def censorshipClean():
    global result
    result=dict()
    return {"result":result}

@app.route("/",methods=['GET'])
def modifyJSON():
    with open(r'C:\Users\allan\Downloads\OneDrive\Self-Censorship\config.json') as fp:
        result=json.load(fp)
    print(result)
    print(request.args)
    result["toogleOn"]=request.args.get("toogleOn")
    result["toogleOff"]=request.args.get("toogleOff")
    with open(r'C:\Users\allan\Downloads\OneDrive\Self-Censorship\config.json', 'w') as fp:
        json.dump(result, fp)
    return {"result":result}

@app.route("/censor/check",methods=['GET'])
def checkJSON():
    with open(r'C:\Users\allan\Downloads\OneDrive\Self-Censorship\config.json') as fp:
        result=json.load(fp)
    
    return {"status":result}

if __name__=="__main__":
#	app.run(host='0.0.0.0')
    app.run(host='localhost', port=5000)
    
    