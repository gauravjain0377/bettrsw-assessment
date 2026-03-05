from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Task
from schemas import TaskSchema, TaskCreateSchema, TaskUpdateSchema
from . import tasks_bp

task_schema = TaskSchema()
task_create_schema = TaskCreateSchema()
task_update_schema = TaskUpdateSchema()


@tasks_bp.route("/tasks", methods=["GET"])
@jwt_required()
def list_tasks():
    current_user_id = int(get_jwt_identity())
    status = request.args.get("status")
    assigned_to = request.args.get("assigned_to")

    tasks = Task.list_tasks(user_id=current_user_id, status=status, assigned_to=assigned_to)
    return jsonify(task_schema.dump(tasks, many=True)), 200


@tasks_bp.route("/tasks", methods=["POST"])
@jwt_required()
def create_task():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    validated = task_create_schema.load(data)

    task = Task.create_task(
        title=validated["title"],
        description=validated.get("description"),
        status=validated.get("status", "todo"),
        assigned_to_id=validated.get("assigned_to"),
        created_by_id=current_user_id,
    )
    return jsonify(task_schema.dump(task)), 201


@tasks_bp.route("/tasks/<int:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id: int):
    current_user_id = int(get_jwt_identity())
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    is_creator = task.created_by == current_user_id
    is_assignee = task.assigned_to == current_user_id
    if not is_creator and not is_assignee:
        return jsonify({"error": "Not allowed"}), 401

    data = request.get_json() or {}
    validated = task_update_schema.load(data)

    # If current user is only the assignee (not creator), they can only change status
    if is_assignee and not is_creator:
        allowed = {}
        if "status" in validated:
            allowed["status"] = validated["status"]
        if not allowed:
            return jsonify({"error": "Nothing to update"}), 400
        task.update_task(**allowed)
    else:
        task.update_task(**validated)
    return jsonify(task_schema.dump(task)), 200


@tasks_bp.route("/tasks/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id: int):
    current_user_id = int(get_jwt_identity())
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    # Only the creator can delete a task
    if task.created_by != current_user_id:
        return jsonify({"error": "Not allowed"}), 401

    task.delete_task()
    return jsonify({"message": "Task deleted"}), 200

