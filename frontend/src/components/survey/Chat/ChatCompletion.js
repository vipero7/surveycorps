import React from 'react';

import { CheckCircle } from 'lucide-react';

const ChatCompletion = () => {
  return (
    <div className="bg-white border-t p-4 text-center">
      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
      <p className="text-gray-600">Survey completed successfully!</p>
    </div>
  );
};

export default ChatCompletion;
