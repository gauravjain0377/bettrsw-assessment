from marshmallow import Schema, fields, validate, validates, ValidationError

from extensions import db
from models import User, Task


class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=validate.Length(min=3, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=150))
    password = fields.Str(load_only=True, required=True, validate=validate.Length(min=6))
    created_at = fields.DateTime(dump_only=True)

    @validates("username")
    def validate_username_unique(self, value: str):
        if User.query.filter_by(username=value).first():
            raise ValidationError("Username already exists.")

    @validates("email")
    def validate_email_unique(self, value: str):
        if User.query.filter_by(email=value).first():
            raise ValidationError("Email already exists.")


class LoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True, load_only=True)


class TaskSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    status = fields.Str(
        required=True,
        validate=validate.OneOf(["todo", "in_progress", "done"]),
        default="todo",
    )
    assigned_to = fields.Int(allow_none=True)
    created_by = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @validates("assigned_to")
    def validate_assigned_to(self, value: int | None):
        if value is not None and not db.session.get(User, value):
            raise ValidationError("Assigned user does not exist.")


class TaskCreateSchema(TaskSchema):
    status = fields.Str(
        missing="todo",
        validate=validate.OneOf(["todo", "in_progress", "done"]),
    )


class TaskUpdateSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    status = fields.Str(
        validate=validate.OneOf(["todo", "in_progress", "done"])
    )
    assigned_to = fields.Int(allow_none=True)

    @validates("assigned_to")
    def validate_assigned_to(self, value: int | None):
        if value is not None and not db.session.get(User, value):
            raise ValidationError("Assigned user does not exist.")

