import Joi from "joi";

export const sendMessageSchema = Joi.object({
  receiverId: Joi.string().required(),
  content: Joi.string().trim().min(1).required(),
});
