import pymongo
from flask import Flask, render_template, request, jsonify, redirect
from bson.objectid import ObjectId
app = Flask(__name__)

from pymongo import MongoClient

# mongodb_URI = "mongodb://localhost:27017/"
# client = MongoClient(mongodb_URI)

# 방법2 - HOST, PORT

#Cluster에 연결하기
client = pymongo.MongoClient("mongodb+srv://root:3d720307@cluster0.w2bgbed.mongodb.net/?retryWrites=true&w=majority")
db = client.sixcandoit

# objectid = str스트링으로 변환해주는 코드들 시작
def getSpecificId(id):
  result = objectIdDecoder(list(db.guestbook.find({"_id": ObjectId(id)})))
  return str(result)

def objectIdDecoder(list):
  results=[]
  for document in list:
    document['_id'] = str(document['_id'])
    results.append(document)
  return results
# objectid = str스트링으로 변환해주는 코드들 끝

@app.route('/')
def home():
   return render_template('index.html')

@app.route("/bucket", methods=["POST"])
def bucket_post():
    bucket_receive = request.form['bucket_receive']

    bucket_list = list(db.buckets.find({}, {'_id': False}))
    count = len(bucket_list) + 1

    doc = {
        'num':count,
        'bucket':bucket_receive,
        'done':0
    }
    db.buckets.insert_one(doc)

    return jsonify({'msg': '저장 완료!'})

@app.route("/bucket/done", methods=["POST"])
def bucket_done():
    num_receive = request.form['num_receive']
    db.buckets.update_one({'num': int(num_receive)}, {'$set': {'done': 1}})
    return jsonify({'msg': '버킷 완료!'})

@app.route("/bucket", methods=["GET"])
def bucket_get():

    bucket_list = list(db.buckets.find({}, {'_id': False}))

    return jsonify({'buckets': bucket_list})

###member01 우태현 응원댓글 POST 요청 시작###
@app.route("/member/guestbook", methods=["POST"])
def guestbook_post():
    name_receive = request.form["name_receive"]
    comment_receive = request.form["comment_receive"]

    doc = {
        'name': name_receive,
        'comment': comment_receive,
    }
    db.guestbook.insert_one(doc)
    return jsonify({'msg':'응원댓글 작성 완료'})

###member01 우태현 응원댓글 POST 요청 끝###




# 수정
@app.route("/member/guestbook/<id>", methods=["PUT"])
def member_update(id):
    name_receive = request.form['name_receive']
    comment_receive = request.form['comment_receive']
    db.guestbook.update_one({'_id': ObjectId(id)}, {'$set': {'name': name_receive}})
    db.guestbook.update_one({'_id': ObjectId(id)}, {'$set': {'comment': comment_receive}})
    return jsonify({'msg': '수정 완료!'})
# 수정 끝

# 삭제
@app.route("/member/guestbook/<id>", methods=["DELETE"])
def member_delete(id):
    db.guestbook.delete_one({'_id': ObjectId(id)})
    return jsonify({'msg': '삭제 완료!'})
#삭제 끝

@app.route("/member/guestbook", methods=["GET"])
def member_get():
    comment_list = objectIdDecoder(list(db.guestbook.find({})))
    return jsonify({'comments': comment_list})


if __name__ == '__main__':
   app.run('0.0.0.0', port=3000, debug=True)