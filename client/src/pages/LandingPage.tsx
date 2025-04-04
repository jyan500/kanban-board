import React from "react"
import { IconBell } from "../components/icons/IconBell"
import { IconGear } from "../components/icons/IconGear"
import { IconClipboardList } from "../components/icons/IconClipboardList"
import { IconTree } from "../components/icons/IconTree"
import { IconTextArea } from "../components/icons/IconTextArea"
import { IconComment } from "../components/icons/IconComment"
import { IconBulkAction } from "../components/icons/IconBulkAction"
import { IconDragDrop } from "../components/icons/IconDragDrop"
import { Footer } from "../components/page-elements/Footer"
import { Header } from "../components/landing-page/Header"

const features = [
	{
		title: "Inline Ticket Editing",
		description: "Edit tickets with a sleek inline modal featuring rich text support.",
		icon: <IconTextArea className="tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-blue-500" />,
	},
	{
		title: "Ticket Linking & Epics",
		description: "Organize work efficiently with parent-child and linked issues.",
		icon: <IconTree className="tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-green-500" />,
	},
	{
		title: "Group by & Drag-and-Drop",
		description: "Flexible board display with grouping and drag-and-drop statuses.",
		icon: <IconDragDrop className="tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-yellow-500" />,
	},
	{
		title: "Mentions & Comments",
		description: "Tag teammates in rich text comments and descriptions.",
		icon: <IconComment className="tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-purple-500" />,
	},
	{
		title: "Bulk Actions",
		description: "Apply actions to multiple tickets to optimize your workflow.",
		icon: <IconBulkAction className = "tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-blue-500"/>
	},
	{
		title: "Backlog & Issue Tracking",
		description: "Track upcoming work and stay on top of the backlog.",
		icon: <IconClipboardList className="tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-red-500" />,
	},
	{
		title: "Notifications",
		description: "Stay informed with smart, real-time notifications.",
		icon: <IconBell className="tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-indigo-500" />,
	},
	{
		title: "Organization & User Settings",
		description: "Manage your organization and personal preferences easily.",
		icon: <IconGear className="tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6 tw-text-gray-500" />,
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
        <main className="tw-px-6 tw-py-16">
            <div className="tw-max-w-4xl tw-mx-auto tw-text-center">
                <h2 className="tw-text-4xl tw-font-bold tw-mb-4">Project Management Made Easy</h2>
                <p className="tw-text-lg tw-text-gray-600 tw-mb-10">
                    Kanban helps startups and small teams stay agile without the overhead.
                </p>
            </div>

            <div className="tw-grid md:tw-grid-cols-2 tw-gap-6 tw-max-w-5xl tw-mx-auto">
                {features.map((feature, idx) => (
                    <Card key={idx} className="tw-p-4">
                        <CardContent className="tw-flex tw-gap-4 tw-items-start">
                            {feature.icon}
                            <div>
                                <h3 className="tw-mt-0 tw-text-xl tw-font-semibold tw-mb-1">{feature.title}</h3>
                                <p className="tw-text-sm tw-text-gray-600">{feature.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </main>
	);
}
