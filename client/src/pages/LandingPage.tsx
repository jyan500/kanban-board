import React from "react"
import { IconBell } from "../components/icons/IconBell"
import { IconGear } from "../components/icons/IconGear"
import { IconClipboardList } from "../components/icons/IconClipboardList"
import { IconTree } from "../components/icons/IconTree"
import { IconTextArea } from "../components/icons/IconTextArea"
import { IconComment } from "../components/icons/IconComment"
import { IconDragDrop } from "../components/icons/IconDragDrop"

const features = [
	{
		title: "Inline Ticket Editing",
		description: "Edit tickets with a sleek inline modal featuring rich text support.",
		icon: <IconTextArea className="h-6 w-6 text-blue-500" />,
	},
	{
		title: "Ticket Linking & Epics",
		description: "Organize work efficiently with parent-child and linked issues.",
		icon: <IconTree className="h-6 w-6 text-green-500" />,
	},
	{
		title: "Group by & Drag-and-Drop",
		description: "Flexible Kanban board with grouping and drag-and-drop statuses.",
		icon: <IconDragDrop className="h-6 w-6 text-yellow-500" />,
	},
	{
		title: "Mentions & Comments",
		description: "Tag teammates in rich text comments and descriptions.",
		icon: <IconComment className="h-6 w-6 text-purple-500" />,
	},
	{
		title: "Backlog & Issue Tracking",
		description: "Track upcoming work and stay on top of the backlog.",
		icon: <IconClipboardList className="h-6 w-6 text-red-500" />,
	},
	{
		title: "Notifications",
		description: "Stay informed with smart, real-time notifications.",
		icon: <IconBell className="h-6 w-6 text-indigo-500" />,
	},
	{
		title: "Org & User Settings",
		description: "Manage your organization and personal preferences easily.",
		icon: <IconGear className="h-6 w-6 text-gray-500" />,
	},
];

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
    return (
        <div className={`tw-rounded-2xl tw-shadow-sm tw-border tw-bg-white ${className}`}>
            {children}
        </div>
    );
};

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
    return <div className={`tw-p-4 ${className}`}>{children}</div>;
};

export const LandingPage = () => {
	return (
	    <div className="tw-min-h-screen tw-bg-white tw-text-gray-900">
	        <header className="tw-px-6 tw-py-8 tw-bg-gray-50 tw-border-b tw-border-gray-200">
	            <div className="tw-max-w-7xl tw-mx-auto tw-flex tw-justify-between tw-items-center">
	                <h1 className="tw-text-2xl tw-font-bold">Kanban</h1>
	                <button className = "button">Get Started</button>
	            </div>
	        </header>

	        <main className="tw-px-6 tw-py-16 tw-bg-white">
	            <div className="tw-max-w-4xl tw-mx-auto tw-text-center">
	                <h2 className="tw-text-4xl tw-font-bold tw-mb-4">Project Management made Easy</h2>
	                <p className="tw-text-lg tw-text-gray-600 tw-mb-10">
	                    Kanban helps startups and teams stay agile without the overhead.
	                </p>
	            </div>

	            <div className="tw-grid md:tw-grid-cols-2 tw-gap-6 tw-max-w-5xl tw-mx-auto">
	                {features.map((feature, idx) => (
	                    <Card key={idx} className="tw-p-4">
	                        <CardContent className="tw-flex tw-gap-4 tw-items-start">
	                            {feature.icon}
	                            <div>
	                                <h3 className="tw-text-xl tw-font-semibold tw-mb-1">{feature.title}</h3>
	                                <p className="tw-text-sm tw-text-gray-600">{feature.description}</p>
	                            </div>
	                        </CardContent>
	                    </Card>
	                ))}
	            </div>
	        </main>

	        <footer className="tw-px-6 tw-py-10 tw-border-t tw-bg-gray-50">
	            <div className="tw-max-w-7xl tw-mx-auto tw-text-center tw-text-sm tw-text-gray-500">
	                © {new Date().getFullYear()} Kanban. All rights reserved.
	            </div>
	        </footer>
	    </div>
	);
}
