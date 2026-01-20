import React, { useState, useEffect } from 'react';
import MentionsImage from "../assets/images/landing-page/mentions.png"
import BacklogImage from "../assets/images/landing-page/backlog.png"
import BoardImage from "../assets/images/landing-page/board.png"
import { useScreenSize } from '../hooks/useScreenSize';
import { ImageOverlay } from './page-elements/ImageOverlay';
import { LG_BREAKPOINT } from '../helpers/constants';

interface Feature {
	id: number
	title: string
	description: string
	imageURL: string
}

interface SubHeaderProps {
    textColor?: string
    children?: React.ReactNode
}

const SubHeader = ({textColor="tw-text-gray-900", children}: SubHeaderProps) => {
    return ( 
        <h2 className={`tw-font-mono tw-text-5xl tw-font-bold tw-mb-4 ${textColor}`}>{children}</h2>
    )
}

interface FeatureCardProps {
    id: number
    header?: string
    description?: string
    imageURL?: string
    imageOnRight?: boolean
    onClick: (id: number) => void
}

const FeatureCard = ({id, header, description, imageURL, imageOnRight, onClick}: FeatureCardProps) => {
    return (
        <section className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-my-32">
            <div className="tw-grid md:tw-grid-cols-2 tw-gap-16 tw-items-center">
                {imageOnRight ? (
                    <>                    
                        <div>
                            <SubHeader>{header}</SubHeader>
                            <p className="tw-text-lg tw-text-gray-600 tw-leading-relaxed tw-mb-6">
                                {description}
                            </p>
                        </div>
                        <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-blue-100 tw-rounded-2xl tw-p-8 tw-shadow-lg tw-shadow-blue-600/10">
                            <button onClick={() => onClick(id)} className="tw-w-full tw-h-72 tw-bg-white tw-rounded-xl tw-border-2 tw-border-gray-200 tw-flex tw-items-center tw-justify-center tw-text-blue-600 tw-font-semibold">
                                <img src={imageURL} alt={description} className="tw-relative tw-object-cover tw-w-full tw-rounded-lg" />
                            </button>
                        </div>
                    </>
                ) : (
                    <>                    
                        <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-blue-100 tw-rounded-2xl tw-p-8 tw-shadow-lg tw-shadow-blue-600/10">
                            <button onClick={() => onClick(id)}className="tw-w-full tw-h-72 tw-bg-white tw-rounded-xl tw-border-2 tw-border-gray-200 tw-flex tw-items-center tw-justify-center tw-text-blue-600 tw-font-semibold">
                                <img src={imageURL} alt={description} className="tw-relative tw-object-cover tw-w-full tw-rounded-lg" />
                            </button>
                        </div>
                        <div>
                            <SubHeader>{header}</SubHeader>
                            <p className="tw-text-lg tw-text-gray-600 tw-leading-relaxed tw-mb-6">
                                {description}
                            </p>
                        </div>
                    </>
                )}

            </div>
        </section>
    )
}

export const UpdatedLandingPage = () => {
    const { width, height } = useScreenSize()
	const [showImageOverlay, setShowImageOverlay] = useState<{index: number, show: boolean}>({
		index: 0,
		show: false
	})

    const features: Array<Feature> = [
        {
            id: 1,
            title: "Manage projects end-to-end",
            description: "Edit tickets with a sleek inline modal featuring rich text support. Make quick updates without losing context or breaking your flow.",
            imageURL: BoardImage,
        },
        {
            id: 2,
            title: "Easy Issue Tracking",
            description: "Organize work efficiently with parent-child and linked issues. Connect related tasks to see the full picture and manage dependencies effortlessly.",
            imageURL: BacklogImage,
        },
        {
            id: 3,
            title: "Plan, Collaborate, Launch",
            description: "Flexible board display with grouping and drag-and-drop statuses. Customize your workflow to match how your team actually works.",
            imageURL: MentionsImage,
        },
    ]

    const showFeatureImage = (featureId: number) => {
        setShowImageOverlay({index: featureId, show: true})
    }

    return (
        <div className="tw-min-h-screen tw-text-gray-900">
            {/* Navigation */}
            {/* <nav className="tw-fixed tw-top-0 tw-w-full tw-bg-white/80 tw-backdrop-blur-md tw-border-b tw-border-gray-100 tw-z-50">
                <div className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
                    <div className="tw-flex tw-items-center tw-gap-2 tw-text-xl tw-font-semibold tw-text-blue-600">
                        <svg className="tw-w-6 tw-h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="14" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        Kanban
                    </div>
                    <div className="tw-flex tw-gap-8 tw-items-center">
                        <a href="#" className="tw-text-gray-600 hover:tw-text-blue-600 tw-transition-colors tw-text-sm">Login</a>
                        <a href="#" className="tw-bg-blue-600 tw-text-white tw-px-5 tw-py-2 tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-text-sm tw-font-medium">
                            Register
                        </a>
                    </div>
                </div>
            </nav> */}

            {/* Hero Section */}
            <section className="tw-pt-48 tw-pb-16 tw-px-6 tw-text-center tw-bg-gradient-to-b tw-from-blue-100 tw-to-gray-50">
                <div className="tw-max-w-4xl tw-mx-auto">
                    <h1 className="tw-font-mono tw-text-6xl tw-font-bold tw-mb-6 tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-bg-clip-text tw-text-transparent tw-leading-tight">
                        Project Management Made Easy
                    </h1>
                    <p className="tw-text-xl tw-text-gray-600 tw-mb-10 tw-leading-relaxed">
                        Kanban helps startups and small teams stay agile without the overhead. Streamline your workflow and ship faster.
                    </p>
                    <button className="tw-bg-blue-600 tw-text-white tw-px-10 tw-py-4 tw-rounded-xl tw-text-lg tw-font-semibold hover:tw-bg-blue-700 tw-transition-all hover:-tw-translate-y-0.5 tw-shadow-lg tw-shadow-blue-600/30 hover:tw-shadow-xl hover:tw-shadow-blue-600/40">
                        Get Started
                    </button>
                </div>
            </section>

            {/* Feature Showcase 1 */}
            {features.map((feature: Feature, index: number) => {
                return (
                    <div key={`feature-section-${feature.id}`}>
                        <FeatureCard
                            id={feature.id}
                            header={feature.title}
                            description={feature.description}
                            imageURL={feature.imageURL}
                            onClick={showFeatureImage}
                            /* every other image is on the left*/
                            imageOnRight={index % 2 === 0}
                        />
                    </div>
                )
            })}

            {/* Features Grid */}
            <section className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-my-24">
                <div className="tw-text-center tw-mb-16">
                    <SubHeader>Everything you need to ship</SubHeader>
                    <p className="tw-text-xl tw-text-gray-600">Powerful features that scale with your team</p>
                </div>
                <div className="tw-grid md:tw-grid-cols-3 tw-gap-8">
                    {[
                        { icon: '', title: 'Mentions & Comments', desc: 'Tag teammates in rich text comments and descriptions to keep everyone in the loop.' },
                        { icon: '', title: 'Bulk Actions', desc: 'Apply actions to multiple tickets to optimize your workflow and save time.' },
                        { icon: '', title: 'Backlog & Issue Tracking', desc: 'Track upcoming work and stay on top of the backlog with powerful filtering.' },
                        { icon: '', title: 'Notifications', desc: 'Stay informed with smart, real-time notifications that keep you updated.' },
                        { icon: '️', title: 'Organization Settings', desc: 'Manage your organization and personal preferences easily in one place.' },
                        { icon: '', title: 'Agile Workflow', desc: 'Built for agile teams who value speed and simplicity over complexity.' }
                    ].map((feature, idx) => (
                        <div key={idx} className="tw-bg-white tw-p-8 tw-rounded-xl tw-border tw-border-gray-200 hover:tw-shadow-lg hover:tw-shadow-blue-600/10">
                            <h3 className="tw-text-xl tw-font-semibold tw-mb-3">{feature.title}</h3>
                            <p className="tw-text-gray-600 tw-leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-blue-800 tw-text-white tw-py-20 tw-px-6 tw-my-24 tw-text-center">
                <SubHeader textColor={"tw-white"}>Ready to streamline your workflow?</SubHeader>
                <p className="tw-text-xl tw-mb-8 tw-opacity-90">Join teams who are shipping faster with Kanban</p>
                <button className="tw-bg-white tw-text-blue-600 tw-px-10 tw-py-4 tw-rounded-xl tw-text-lg tw-font-semibold hover:-tw-translate-y-0.5 hover:tw-shadow-2xl hover:tw-shadow-white/30 tw-transition-all">
                    Get Started Free
                </button>
            </section>

            {
             	width >= LG_BREAKPOINT ? 
	             <ImageOverlay imageUrl={features.find((feature: Feature) => feature.id === showImageOverlay.index)?.imageURL ?? ""} isOpen={showImageOverlay.show} onClose={() => setShowImageOverlay({index: showImageOverlay.index, show: false})}/>
	             : null
            }
        </div>
    );
}