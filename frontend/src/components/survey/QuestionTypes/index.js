import ChoiceQuestion from './ChoiceQuestion';
import ContactQuestion from './ContactQuestion';
import DateQuestion from './DateQuestion';
import NumberQuestion from './NumberQuestion';
import RatingQuestion from './RatingQuestion';
import TextQuestion from './TextQuestion';
import TextareaQuestion from './TextareaQuestion';

export const getQuestionComponent = questionType => {
    const components = {
        text: TextQuestion,
        textarea: TextareaQuestion,
        email: ContactQuestion,
        phone: ContactQuestion,
        number: NumberQuestion,
        radio: ChoiceQuestion,
        checkbox: ChoiceQuestion,
        dropdown: ChoiceQuestion,
        rating: RatingQuestion,
        date: DateQuestion,
    };

    return components[questionType] || TextQuestion;
};

export {
    TextQuestion,
    TextareaQuestion,
    ChoiceQuestion,
    NumberQuestion,
    RatingQuestion,
    ContactQuestion,
    DateQuestion,
};
