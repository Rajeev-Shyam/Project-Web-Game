from flask_wtf import FlaskForm
from wtforms import IntegerField,RadioField,SubmitField,StringField,PasswordField
from wtforms.validators import InputRequired, EqualTo , NumberRange

class SignupForm(FlaskForm):
    user_id=StringField("Member id:",validators=[InputRequired()])
    password=PasswordField("Password:",validators=[InputRequired()])
    password2=PasswordField("Confirm password:",validators=[InputRequired(),EqualTo("password")])
    submit=SubmitField("Save")

class LoginForm(FlaskForm):
    user_id=StringField("Member id:",validators=[InputRequired()])
    password=PasswordField("Password:",validators=[InputRequired()])
    submit=SubmitField("Log in")


class Change_pswForm(FlaskForm):
    user_id=StringField("Member id:",validators=[InputRequired()])
    password=PasswordField("Password:",validators=[InputRequired()])
    password2=PasswordField("Confirm password:",validators=[InputRequired(),EqualTo("password")])
    submit=SubmitField("Save")