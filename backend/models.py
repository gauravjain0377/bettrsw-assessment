from datetime import datetime

import bcrypt
from flask_jwt_extended import create_access_token
from sqlalchemy import Enum

from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    created_tasks = db.relationship(
        "Task", backref="creator", foreign_keys="Task.created_by", lazy=True
    )
    assigned_tasks = db.relationship(
        "Task", backref="assignee", foreign_keys="Task.assigned_to", lazy=True
    )

    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.checkpw(
            password.encode("utf-8"), self.password_hash.encode("utf-8")
        )

    @classmethod
    def register(cls, username: str, email: str, password: str):
        user = cls(
            username=username,
            email=email,
            password_hash=cls.hash_password(password),
        )
        db.session.add(user)
        db.session.commit()
        return user

    @classmethod
    def authenticate(cls, username: str, password: str):
        user = cls.query.filter_by(username=username).first()
        if user and user.check_password(password):
            return user
        return None

    def generate_token(self) -> str:
        # Identity must be a string to satisfy JWT subject validation
        return create_access_token(identity=str(self.id))


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(
        Enum("todo", "in_progress", "done", name="task_status"),
        nullable=False,
        default="todo",
    )
    assigned_to = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    @classmethod
    def list_tasks(cls, user_id: int, status: str | None = None, assigned_to: str | None = None):
        query = cls.query

        if status:
            query = query.filter_by(status=status)

        if assigned_to == "me":
            query = query.filter_by(assigned_to=user_id)

        return query.order_by(cls.created_at.desc()).all()

    @classmethod
    def create_task(
        cls,
        title: str,
        description: str | None,
        status: str,
        assigned_to_id: int | None,
        created_by_id: int,
    ):
        task = cls(
            title=title,
            description=description,
            status=status,
            assigned_to=assigned_to_id,
            created_by=created_by_id,
        )
        db.session.add(task)
        db.session.commit()
        return task

    def update_task(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key) and value is not None:
                setattr(self, key, value)
        db.session.commit()
        return self

    def delete_task(self):
        db.session.delete(self)
        db.session.commit()

