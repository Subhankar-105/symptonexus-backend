const axios = require("axios");

class ChatEngine {

  static async handle(message) {
    try {

      console.time("LLM");

      const aiResponse = await this.getMedicalResponse(message);

      console.timeEnd("LLM");

      // ✅ FIXED STRUCTURE (NO response nesting)
      return {
        type: "result",
        ...aiResponse
      };

    } catch (err) {
      console.error("CHAT ENGINE ERROR:", err.message);

      return {
        type: "error",
        message: "Something went wrong"
      };
    }
  }

  // =========================
  // 🔥 FULL AI RESPONSE
  // =========================
  static async getMedicalResponse(userInput) {
    try {

      console.log("USER INPUT:", userInput);

      const prompt = `
You are a medical AI assistant.

Understand the user's symptoms even if there are spelling mistakes and grammatical mistakes.

Always be consistent. Same symptoms → same answer.

Return ONLY JSON:

{
  "possible_conditions": "short answer",
  "specialization": "write the most relevant specialization according to the result",
  "advice": {
    "tip1": "text",
    "tip2": "text"
  }
}

Specializations list (choose ONLY one):
- general physician
- cardiologist
- dermatologist
- pediatrician
- general surgeon
- dentist
- ophthalmologist
- ent
- psychiatrist
- neurologist
- orthopedic
- gynecologist

Rules:
- Do NOT suggest medicines
- Only home remedies
- Keep answer short and clear

User:
${userInput}
`;

      const res = await axios.post(
        "http://localhost:11434/api/generate",
        {
          model: "phi3",
          prompt,
          stream: false,
          options: {
            num_predict: 120,
            temperature: 0   // 🔥 FIXED CONSISTENCY
          }
        },
        {
          timeout: 100000
        }
      );

      const raw = res.data.response || "";

      console.log("======== RAW LLM OUTPUT ========");
      console.log(raw);
      console.log("================================");

      // ✅ SAFE JSON EXTRACTION
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");

      if (start === -1 || end === -1) {
        return {
          possible_conditions: "Not clear",
          specialization: "general physician",
          advice: {
            tip1: "Please describe your symptoms clearly",
            tip2: "Include duration and severity"
          }
        };
      }

      const jsonString = raw.substring(start, end + 1);

      try {
        const parsed = JSON.parse(jsonString);

        // ✅ ENSURE STRUCTURE ALWAYS SAFE
        return {
          possible_conditions: parsed.possible_conditions || "Not clear",
          specialization: parsed.specialization || "general physician",
          advice: parsed.advice || {
            tip1: "Take rest",
            tip2: "Stay hydrated"
          }
        };

      } catch (err) {
        console.error("JSON PARSE ERROR:", err.message);

        return {
          possible_conditions: "Not clear",
          specialization: "general physician",
          advice: {
            tip1: "Please try again",
            tip2: "Give more details"
          }
        };
      }

    } catch (err) {
      console.error("LLM ERROR:", err.message);

      return {
        possible_conditions: "Error",
        specialization: "general physician",
        advice: {
          tip1: "Server busy",
          tip2: "Try again later"
        }
      };
    }
  }
}

module.exports = ChatEngine;