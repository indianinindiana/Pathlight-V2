"""
Clara Fallback Responses
Provides context-aware fallback messages when AI providers are unavailable.
These messages are conversational, empathetic, and aligned with Clara's personality.
"""

from typing import Dict, Any, Optional


def get_clara_fallback(step_id: str, user_answers: Dict[str, Any]) -> str:
    """
    Get Clara's fallback response based on the question and user's answer.
    
    Args:
        step_id: The question ID
        user_answers: All user answers collected so far
    
    Returns:
        Clara's empathetic fallback message (1-2 sentences)
    """
    
    # Get the specific answer for this step
    answer = user_answers.get(step_id)
    
    # Q1: Money Goal
    if step_id == "primaryGoal":
        goal_messages = {
            "pay-faster": "Great—taking steps to speed things up can create real momentum. You're off to a strong start.",
            "reduce-interest": "Got it. Reducing interest can make things feel a lot more manageable over time.",
            "reduce-payment": "Thanks for sharing—easing the monthly pressure can make a big difference in your day-to-day.",
            "avoid-behind": "You're doing the right thing by getting ahead of this. We'll take it one step at a time."
        }
        return goal_messages.get(answer, "Thanks for sharing your goal. Let's work on making it happen.")
    
    # Q2: Stress Level
    elif step_id == "stressLevel":
        stress = int(answer) if answer else 3
        if stress <= 2:
            return "Good to hear—feeling steady gives you a solid foundation to build from."
        elif stress == 3:
            return "I hear you. Money can feel complicated, but we'll make this simpler together."
        else:  # 4-5
            return "Thanks for sharing that—talking about this can be tough. You're not alone here."
    
    # Q3: Life Events (Optional)
    elif step_id == "lifeEvents":
        if answer and len(answer) > 0:
            return "Life can get overwhelming at times. What matters is that you're taking steps forward now."
        else:
            return "No problem at all—let's keep going."
    
    # Q4: Age Range
    elif step_id == "ageRange":
        age_messages = {
            "18-24": "It's great that you're taking control early. These habits really add up over time.",
            "25-34": "You're at a strong stage to build momentum and shape your financial future.",
            "35-44": "This is a meaningful time to make decisions that can set you up long-term.",
            "45-54": "It's never too late to find a plan that fits your needs.",
            "55-64": "Smart planning at this stage can make a big difference moving forward.",
            "65+": "Your experience really comes through—let's make things as clear and simple as possible."
        }
        return age_messages.get(answer, "Thanks for sharing—that helps me understand where you're at.")
    
    # Q5: Employment Status
    elif step_id == "employmentStatus":
        employment_messages = {
            "full-time": "Thanks for sharing—knowing your work situation helps keep things realistic and grounded.",
            "part-time": "Thanks for sharing—knowing your work situation helps keep things realistic and grounded.",
            "self-employed": "Thanks for sharing—knowing your work situation helps keep things realistic and grounded.",
            "unemployed": "I know that can be a stressful place to be. We'll work with where you are today.",
            "retired": "Thanks—that helps us keep your situation front and center as we go.",
            "student": "Balancing expenses in school is tough. You're doing the right thing by planning ahead."
        }
        return employment_messages.get(answer, "Thanks for sharing—that helps me understand your situation.")
    
    # Q6: Monthly Income
    elif step_id == "monthlyIncome":
        income = float(answer) if answer else 0
        if income < 2000:
            return "Every dollar matters right now, and it's okay. We'll keep things practical."
        else:
            return "Thanks—that gives a clearer picture of what's possible for you."
    
    # Q7: Monthly Expenses
    elif step_id == "monthlyExpenses":
        income = float(user_answers.get("monthlyIncome", 0))
        expenses = float(answer) if answer else 0
        
        if income > expenses:
            return "Good news—you've got a little room to work with."
        elif income == expenses:
            return "Thanks—this helps us understand where things feel tight and where we can create space."
        else:
            return "It's okay to be in a tight spot. You're taking an important step by looking at this now."
    
    # Q8: Liquid Savings
    elif step_id == "liquidSavings":
        savings = float(answer) if answer else 0
        if savings > 5000:
            return "That's a great safety cushion. It gives you some breathing room."
        elif savings < 1000 and savings > 0:
            return "A lot of people are in this spot. You're starting from a good place—awareness."
        elif savings == 0:
            return "Thanks for being honest—many people start here. We'll take things one step at a time."
        else:
            return "Thanks for sharing—that helps me understand your financial cushion."
    
    # Q9: Credit Score Range
    elif step_id == "creditScore":
        score_messages = {
            "800+": "Nice—your score gives you some helpful flexibility as you move forward.",
            "740-799": "Nice—your score gives you some helpful flexibility as you move forward.",
            "670-739": "Thanks—there's room to grow, and taking action now can help over time.",
            "580-669": "You're not alone—many people begin here. What matters is that you're starting.",
            "below-580": "You're not alone—many people begin here. What matters is that you're starting.",
            "unknown": "Totally fine—we can still move forward without it."
        }
        return score_messages.get(answer, "Thanks for sharing—that helps me understand your credit situation.")
    
    # Default fallback
    return "Thank you for sharing that. Let's keep going."


def get_resume_message() -> str:
    """Get Clara's message when user resumes a session"""
    return "Welcome back! Let's continue where you left off."


def get_completion_message() -> str:
    """Get Clara's final message when onboarding is complete"""
    return "Thanks for sharing all that. I'm excited to help you from here."