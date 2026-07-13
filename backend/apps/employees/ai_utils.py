import json
from django.conf import settings

def analyze_employee_skills_and_training(employee, employee_skills, required_competencies, available_trainings):
    """
    Calls the Gemini API (if configured) or returns a mock response to analyze
    an employee's skills vs required competencies, and recommends trainings.
    """
    
    # If no API key is provided, return a mock response for UI testing
    if not settings.GEMINI_API_KEY:
        return {
            "analysis": f"Simulated AI Analysis for {employee.user.get_full_name()}. The employee shows strong potential but has some skill gaps compared to the {employee.position.name if employee.position else 'Unknown'} role requirements.",
            "identified_gaps": [
                {"skill": comp.skill.name, "gap": f"Required Level {comp.required_level}, but currently lower."}
                for comp in required_competencies[:2]
            ] if required_competencies else [{"skill": "General Skills", "gap": "Needs improvement"}],
            "recommended_trainings": [
                {"training_id": t.id, "title": t.title, "reason": "Highly relevant to close identified skill gaps."}
                for t in available_trainings[:2]
            ] if available_trainings else []
        }
        
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        # Build prompt
        prompt = f"You are an expert HR AI assistant. Analyze the skills of the following employee and recommend training programs to close any gaps.\\n"
        prompt += f"Employee Name: {employee.user.get_full_name()}\\n"
        prompt += f"Job Position: {employee.position.name if employee.position else 'Unassigned'}\\n\\n"
        
        prompt += "Current Skills:\\n"
        for es in employee_skills:
            prompt += f"- {es.skill.name}: Level {es.proficiency}\\n"
            
        prompt += "\\nRequired Competencies for Position:\\n"
        for rc in required_competencies:
            prompt += f"- {rc.skill.name}: Level {rc.required_level} (Critical: {rc.is_critical})\\n"
            
        prompt += "\\nAvailable Training Programs (ID - Title: Description):\\n"
        for t in available_trainings:
            prompt += f"- ID {t.id} - {t.title}: {t.description}\\n"
            
        prompt += """
        Based on this data, provide a JSON response with the following exact structure (do not use markdown formatting, just raw JSON):
        {
            "analysis": "A brief paragraph summarizing their skill alignment with their role.",
            "identified_gaps": [
                {"skill": "Skill Name", "gap": "Description of the gap"}
            ],
            "recommended_trainings": [
                {"training_id": <integer ID from available trainings>, "title": "Training Title", "reason": "Why this is recommended"}
            ]
        }
        """
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        
        # Parse JSON
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        return json.loads(text)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {
            "error": "Failed to analyze skills using AI.",
            "details": str(e)
        }
