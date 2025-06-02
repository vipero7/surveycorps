import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SurveyHeader from '../../components/survey/SurveyHeader';
import PageHeader from '../../components/layout/PageHeader';
import SurveyBasicInfo from '../../components/survey/SurveyBasicInfo';
import SurveySidebar from '../../components/survey/SurveySidebar';
import TabNavigation from '../../components/survey/TabNavigation';
import SurveyFormLayout from '../../components/survey/SurveyFormLayout';
import QuestionSection from '../../components/survey/QuestionSection';
import useSurveyForm from '../../hooks/useSurveyForm';

const CreatePage = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('manual');

	const {
		survey,
		setSurvey,
		questions,
		setQuestions,
		loading,
		addQuestion,
		updateQuestion,
		removeQuestion,
		saveDraft,
		saveAndDistribute
	} = useSurveyForm(navigate);

	const handleCSVParsed = (csvQuestions) => {
		setQuestions(csvQuestions);
		setActiveTab('manual');
		console.log(`Successfully imported ${csvQuestions.length} questions from CSV`);
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<SurveyHeader onBack={() => navigate('/dashboard/surveys')} />
			<PageHeader
				title="Create New Survey"
				subtitle="Build your survey manually or import from CSV"
			/>

			<SurveyFormLayout
				mainContent={
					<>
						<TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
						<SurveyBasicInfo survey={survey} onChange={setSurvey} />
						<QuestionSection
							activeTab={activeTab}
							questions={questions}
							onAddQuestion={addQuestion}
							onUpdateQuestion={updateQuestion}
							onRemoveQuestion={removeQuestion}
							onCSVParsed={handleCSVParsed}
						/>
					</>
				}
				sidebar={
					<SurveySidebar
						survey={survey}
						questions={questions}
						loading={loading}
						onSaveDraft={saveDraft}
						onPublish={saveAndDistribute}
					/>
				}
			/>
		</div>
	);
};

export default CreatePage;