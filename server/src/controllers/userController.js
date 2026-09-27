import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { createToken } from "../utils/token.js";

const PUBLIC_FIELDS = "-password";

function pickUserInput(body) {
  const input = {};

  if (body.email !== undefined) input.email = body.email;
  if (body.name !== undefined) input.name = body.name;
  if (body.user_type !== undefined) input.user_type = body.user_type;
  if (body.address !== undefined) input.address = body.address;
  if (body.password) input.password = body.password;

  return input;
}

function toPublicUser(user) {
  const data = user.toObject();
  delete data.password;
  return data;
}

function toAuthResponse(user) {
  return {
    user: toPublicUser(user),
    token: createToken(user),
  };
}

export async function loginUser(req, res, next) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ message: "이메일과 비밀번호를 입력하세요." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    res.json(toAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res) {
  res.json(toPublicUser(req.user));
}

export async function createUser(req, res, next) {
  try {
    const input = pickUserInput(req.body);
    if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }

    const user = await User.create(input);
    res.status(201).json(toAuthResponse(user));
  } catch (error) {
    next(error);
  }
}

export async function getUsers(_req, res, next) {
  try {
    const users = await User.find().select(PUBLIC_FIELDS).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
}

export async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select(PUBLIC_FIELDS);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const input = pickUserInput(req.body);
    if (input.password) {
      input.password = await bcrypt.hash(input.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.params.id, input, {
      new: true,
      runValidators: true,
    }).select(PUBLIC_FIELDS);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const user = await User.findByIdAndDelete(req.params.id).select(PUBLIC_FIELDS);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted", user });
  } catch (error) {
    next(error);
  }
}
