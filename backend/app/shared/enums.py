from enum import Enum

class AgeRange(str, Enum):
    AGE_18_24 = "18-24"
    AGE_25_34 = "25-34"
    AGE_35_44 = "35-44"
    AGE_45_59 = "45-59"
    AGE_60_PLUS = "60+"

class EmploymentStatus(str, Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    SELF_EMPLOYED = "self-employed"
    UNEMPLOYED = "unemployed"
    STUDENT = "student"
    RETIRED = "retired"

class CreditScoreRange(str, Enum):
    POOR = "300-579"
    FAIR = "580-669"
    GOOD = "670-739"
    VERY_GOOD = "740-799"
    EXCELLENT = "800-850"

class LifeEvent(str, Enum):
    INCOME_INCREASE = "income-increase"
    INCOME_DECREASE = "income-decrease"
    MAJOR_EXPENSE = "major-expense"
    HOUSEHOLD_CHANGES = "household-changes"
    OTHER_GOALS = "other-goals"

class PrimaryGoal(str, Enum):
    PAY_FASTER = "pay-faster"
    LOWER_PAYMENT = "lower-payment"
    REDUCE_INTEREST = "reduce-interest"
    AVOID_DEFAULT = "avoid-default"

class DebtType(str, Enum):
    CREDIT_CARD = "credit-card"
    AUTO_LOAN = "auto-loan"
    STUDENT_LOAN = "student-loan"
    MORTGAGE = "mortgage"
    PERSONAL_LOAN = "personal-loan"
    INSTALLMENT_LOAN = "installment-loan"

class APRType(str, Enum):
    FIXED = "fixed"
    VARIABLE = "variable"

class PaymentType(str, Enum):
    MINIMUM = "minimum"
    FIXED_AMOUNT = "fixed-amount"
    FULL = "full"
    CUSTOM = "custom"

class LoanProgram(str, Enum):
    FEDERAL = "federal"
    PRIVATE = "private"