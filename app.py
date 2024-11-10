from flask import Flask,render_template, url_for, session, redirect, g, request, flash
from flask_session import Session
from database import get_db,close_db
from forms import LoginForm,SignupForm, Change_pswForm
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash


app = Flask(__name__)
app.config["SECRET_KEY"] = "my_key"
app.teardown_appcontext(close_db)
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.before_request
def load_logged_in_user():
    g.user = session.get("user_id", None)

def login_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if g.user is None:
            return redirect(url_for("login", next=request.url))
        return view(*args, **kwargs)
    return wrapped_view

@app.route("/blackhole")
@login_required
def blackhole():
    return render_template("blackhole.html")

@app.route("/score", methods=["POST"])
def add_score():
    user_id = session['user_id']
    score = int(request.form["score"])
    db = get_db()
    cursor = db.cursor()
    high_score = cursor.execute("""SELECT score FROM scoreboard WHERE user_id = ?;""", (user_id,)).fetchone()
    if high_score is None or score > high_score[0]:
        cursor.execute("""UPDATE scoreboard SET score = ? WHERE user_id = ?;""", (score, user_id))
        db.commit()
        return "success"
    else:
        return "failure"
    

@app.route("/scoreboard")
@login_required
def scoreboard():
    db = get_db()
    cursor = db.cursor()
    scoreboard = cursor.execute("SELECT user_id, score FROM scoreboard ORDER BY score DESC LIMIT 10;").fetchall()
    return render_template("scoreboard.html", scoreboard=scoreboard)

@app.route("/signup",methods=["GET","POST"])
def signup():
    form = SignupForm()
    if form.validate_on_submit():
        user_id=form.user_id.data
        password=form.password.data
        score=0
        db= get_db()
        conflict_user = db.execute("""Select * from users
                            Where user_id = ?;""",(user_id,)).fetchone()
        if conflict_user is not None:
            form.user_id.errors.append("Username is already taken. Please try a different one.")
        else:
            db.execute("""INSERT INTO users(user_id, password) 
                       Values (?,?);""",(user_id, generate_password_hash(password)))
            db.commit()
            db.execute("""INSERT INTO scoreboard (user_id,score)
                       Values (?,?);""", (user_id,score))
            db.commit()
            return redirect( url_for("login"))
    return render_template("signup.html",form=form)
    
@app.route("/login",methods=["GET","POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user_id=form.user_id.data
        password=form.password.data
        db=get_db()
        user = db.execute("""Select * from users where user_id = ?;""",(user_id,)).fetchone()
        if user is None:
            form.user_id.errors.append("This username doesn't exist")
        elif not check_password_hash(user["password"], password):
            form.password.errors.append("Incorrect password")
        else:
            session.clear()
            session["user_id"] = user_id
            return redirect(url_for("index"))
    return render_template("login.html", form=form)

@app.route("/password_change",methods=["GET","POST"])
def password_change():
    form = Change_pswForm()
    if form.validate_on_submit():
        user_id=form.user_id.data
        password=form.password.data
        db=get_db()
        cursor=db.cursor()
        user = db.execute("""Select * from users where user_id = ?;""",(user_id,)).fetchone()
        if user is None:
            form.user_id.errors.append("This username doesn't exist")
        else:
            cursor.execute("""Update users set password = ?
                       where user_id=?;""",(generate_password_hash(password),user_id))
            db.commit()
            return redirect(url_for("login"))
    return render_template("pswchange.html", form=form)

@app.route("/howToPlay")
def howToPlay():
    return render_template("howToPlay.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect( url_for("index") )
