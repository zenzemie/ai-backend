const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

const schemas = {
  discover: Joi.object({
    category: Joi.string().required().min(2).max(50),
    location: Joi.string().required().min(2).max(100)
  }),
  sendEmail: Joi.object({
    leadId: Joi.string().required(),
    subject: Joi.string().required().min(5).max(200),
    body: Joi.string().required().min(20).max(5000)
  }),
  generateOutreach: Joi.object({
    leadId: Joi.string().required(),
    tone: Joi.string().required().valid('friendly', 'persuasive', 'formal', 'luxury', 'aggressive'),
    serviceFocus: Joi.string().required().min(3).max(100)
  }),
  automation: Joi.object({
    name: Joi.string().required().min(3).max(100),
    trigger: Joi.object({
      type: Joi.string().required().valid(
        'new_lead_discovered',
        'email_opened',
        'replied_interested',
        'status_changed',
        'missed_call_detected',
        'appointment_booked_voice',
        'wa_button_clicked',
        'negative_review_received',
        'webhook_inbound',
        'scheduled_trigger'
      ),
      value: Joi.string().optional()
    }).required(),
    actions: Joi.array().items(
      Joi.object({
        actionType: Joi.string().required().valid(
          'send_whatsapp_pitch',
          'send_email_followup',
          'update_lead_status',
          'alert_owner_whatsapp',
          'request_review_sms',
          'generate_social_post',
          'trigger_external_webhook',
          'schedule_followup'
        ),
        actionData: Joi.object().required(),
        condition: Joi.object({
          field: Joi.string().required(),
          operator: Joi.string().valid('==', '!=', '>', '<', '>=', '<=', 'AND', 'OR', 'contains').required(),
          value: Joi.any().required()
        }).optional(),
        delay: Joi.number().optional() // milliseconds
      })
    ).min(1).required()
  })
};

module.exports = {
  validateRequest,
  schemas
};
