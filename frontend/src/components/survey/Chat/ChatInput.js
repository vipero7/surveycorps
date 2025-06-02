import React from 'react';

import { Send } from 'lucide-react';

import QuestionInput from './QuestionInput';

const ChatInput = ({ question, currentAnswer, setCurrentAnswer, onSubmit, submitting }) => {
    const handleSubmit = () => {
        onSubmit();
    };

    return (
        <div className="bg-white border-t p-4">
            <div className="flex space-x-3 items-end">
                <QuestionInput
                    question={question}
                    value={currentAnswer}
                    onChange={setCurrentAnswer}
                    onEnterPress={handleSubmit}
                />
                <button
                    onClick={handleSubmit}
                    disabled={
                        submitting || (!currentAnswer && question.question_type !== 'checkbox')
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ChatInput;
