export const qualificationJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "summary",
    "extracted",
    "qualification",
    "missingInformation",
    "risks",
    "score",
    "replyDraft",
  ],
  properties: {
    summary: {
      type: "string",
    },

    extracted: {
      type: "object",
      additionalProperties: false,
      required: [
        "projectType",
        "requestedServices",
        "budget",
        "timeline",
        "companyContext",
        "mainGoal",
      ],
      properties: {
        projectType: {
          type: "string",
        },
        requestedServices: {
          type: "array",
          items: {
            type: "string",
          },
        },
        budget: {
          type: ["string", "null"],
        },
        timeline: {
          type: ["string", "null"],
        },
        companyContext: {
          type: ["string", "null"],
        },
        mainGoal: {
          type: ["string", "null"],
        },
      },
    },

    qualification: {
      type: "object",
      additionalProperties: false,
      required: [
        "serviceFit",
        "urgency",
        "completenessScore",
        "priority",
      ],
      properties: {
        serviceFit: {
          type: "string",
          enum: [
            "poor",
            "partial",
            "good",
            "excellent",
          ],
        },
        urgency: {
          type: "string",
          enum: ["low", "medium", "high"],
        },
        completenessScore: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        priority: {
          type: "string",
          enum: [
            "low",
            "medium",
            "high",
            "urgent",
          ],
        },
      },
    },

    missingInformation: {
      type: "array",
      items: {
        type: "string",
      },
    },

    risks: {
      type: "array",
      items: {
        type: "string",
      },
    },

    score: {
      type: "object",
      additionalProperties: false,
      required: [
        "total",
        "budget",
        "timeline",
        "completeness",
        "serviceFit",
        "urgency",
        "descriptionQuality",
        "explanation",
      ],
      properties: {
        total: {
          type: "integer",
          minimum: 0,
          maximum: 100,
        },
        budget: {
          type: "integer",
          minimum: 0,
          maximum: 25,
        },
        timeline: {
          type: "integer",
          minimum: 0,
          maximum: 15,
        },
        completeness: {
          type: "integer",
          minimum: 0,
          maximum: 20,
        },
        serviceFit: {
          type: "integer",
          minimum: 0,
          maximum: 20,
        },
        urgency: {
          type: "integer",
          minimum: 0,
          maximum: 10,
        },
        descriptionQuality: {
          type: "integer",
          minimum: 0,
          maximum: 10,
        },
        explanation: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    },

    replyDraft: {
      type: "object",
      additionalProperties: false,
      required: ["subject", "body"],
      properties: {
        subject: {
          type: "string",
        },
        body: {
          type: "string",
        },
      },
    },
  },
} as const