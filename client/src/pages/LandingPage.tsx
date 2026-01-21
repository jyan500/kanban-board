import React, { useState, useEffect } from 'react';
import MentionsImage from "../assets/images/landing-page/mentions.png"
import BacklogImage from "../assets/images/landing-page/backlog.png"
import BoardImage from "../assets/images/landing-page/board.png"
import { useScreenSize } from '../hooks/useScreenSize';
import { ImageOverlay } from '../components/page-elements/ImageOverlay';
import { LG_BREAKPOINT } from '../helpers/constants';
import { Link } from "react-router-dom"
import { LOGIN } from '../helpers/routes';
import { IconBell } from "../components/icons/IconBell"
import { IconGear } from "../components/icons/IconGear"
import { IconClipboardList } from "../components/icons/IconClipboardList"
import { IconTree } from "../components/icons/IconTree"
import { IconTextArea } from "../components/icons/IconTextArea"
import { IconComment } from "../components/icons/IconComment"
import { IconBulkAction } from "../components/icons/IconBulkAction"
import { IconDragDrop } from "../components/icons/IconDragDrop"
import { REGISTER } from "../helpers/routes"
import { MultiCardCarousel } from "../components/page-elements/MultiCardCarousel"
import BulkActionsImage from "../assets/images/landing-page/bulk-actions.png"
import EpicTicketsImage from "../assets/images/landing-page/epic-tickets.png"
import NotificationsImage from "../assets/images/landing-page/notifications.png"
import SettingsImage from "../assets/images/landing-page/organization-settings.png"
import RTEImage from "../assets/images/landing-page/rich-text-editing.png"

interface Feature {
	id: number
    icon?: React.ReactElement
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
    const headerCard = (
        <div>
            <SubHeader>{header}</SubHeader>
            <p className="tw-text-lg tw-text-gray-600 tw-leading-relaxed tw-mb-6">
                {description}
            </p>
        </div>
    )
    const image = (
        <button onClick={() => onClick(id)} className={`tw-bg-gradient-light tw-rounded-2xl tw-p-8 tw-shadow-lg tw-transition-all tw-shadow-lg hover:tw-shadow-xl hover:tw-shadow-blue-600/40`}>
            <div className="tw-w-full tw-h-72 tw-bg-white tw-rounded-xl tw-border-2 tw-border-gray-200 tw-flex tw-items-center tw-justify-center tw-text-blue-600 tw-font-semibold">
                <img src={imageURL} alt={description} className="tw-relative tw-object-cover tw-w-full tw-rounded-lg" />
            </div>
        </button>
    )
    return (
        <section className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-my-32">
            <div className="tw-grid md:tw-grid-cols-2 tw-gap-16 tw-items-center">
                {imageOnRight ? (
                    <>                    
                        {headerCard}
                        {image}
                    </>
                ) : (
                    <>                    
                        {image}
                        {headerCard}
                    </>
                )}

            </div>
        </section>
    )
}

interface CarouselElement {
	id: number
	title: string
	imageURL?: string
	description?: string
}

interface CarouselContentProps<T = {}> {
	data: T
}

const ImageCarouselContent = ({data}: CarouselContentProps<CarouselElement>) => {
	return (
		<>
	        <img src={data.imageURL} alt={data.title} className="tw-relative tw-object-cover tw-w-full tw-h-[45vh] tw-rounded-lg" />
	        {/* Adds linear gradient starting from mid to bottom of the image to provide more contrast with the white text*/}
        	<div className="tw-mx-2 tw-rounded-lg tw-absolute tw-inset-0 tw-bg-gradient-to-b tw-from-transparent tw-to-black tw-from-60%">
		        <p className = "tw-absolute tw-bottom-4 tw-left-4 tw-text-2xl tw-font-bold tw-text-white">{data.title}</p>
        	</div>
        </>
	)
}

const createImageCarouselElements = (data: Array<CarouselElement>) => {
	if (data.length){
		const carouselElements = data.map((element: CarouselElement) => {
			return <ImageCarouselContent data={element}/>
		})
		return carouselElements
	}
	return []	
}

const iconClass = "tw-shrink-0 tw-h-5 tw-w-5 tw-text-blue-50"


export const LandingPage = () => {
    const { width, height } = useScreenSize()
	const [carouselIndex, setCarouselIndex] = useState(0)
	const [showImageOverlay, setShowImageOverlay] = useState<{id: number, show: boolean}>({
		id: 0,
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

    const additionalFeatures: Array<Feature> = [
        {
            id: 4,
            title: "Mentions & Comments",
            description: "Tag teammates in rich text comments and descriptions.",
            icon: <IconComment className={`${iconClass}`} />,
            imageURL: MentionsImage,
        },
        {
            id: 5,
            title: "Bulk Actions",
            description: "Apply actions to multiple tickets to optimize your workflow.",
            icon: <IconBulkAction className = {`${iconClass}`}/>,
            imageURL: BulkActionsImage,
        },
        {
            id: 6,
            title: "Backlog & Issue Tracking",
            description: "Track upcoming work and stay on top of the backlog.",
            icon: <IconClipboardList className={`${iconClass}`} />,
            imageURL: BacklogImage,
        },
        {
            id: 7,
            title: "Notifications",
            description: "Stay informed with smart, real-time notifications.",
            icon: <IconBell className={`${iconClass}`} />,
            imageURL: NotificationsImage,
        },
        {
            id: 8,
            title: "Organization & User Settings",
            description: "Manage your organization and personal preferences easily.",
            icon: <IconGear className={`${iconClass}`}/>,
            imageURL: SettingsImage,
        },
    ]

    const showFeatureImage = (featureId: number) => {
        setShowImageOverlay({id: featureId, show: true})
    }

    return (
        <div className="tw-text-gray-900">
            {/* Hero Section */}
            <section className={`tw-bg-gradient-background tw-pt-48 tw-pb-16 tw-px-6 tw-text-center`}>
                {/* Applies a staggered animation with animation-delay */}
                <div className="tw-max-w-4xl tw-mx-auto">
                    <h1 className="tw-font-mono tw-text-6xl tw-font-bold tw-mb-6 tw-bg-gradient-dark tw-bg-clip-text tw-text-transparent tw-leading-tight tw-animate-fade-in-up">
                        Project Management Made Easy
                    </h1>
                    <p className="tw-text-xl tw-text-gray-600 tw-mb-10 tw-leading-relaxed tw-opacity-0 tw-animate-fade-in-up [animation-delay:200ms]">
                        Kanban helps startups and small teams stay agile without the overhead. Streamline your workflow and ship faster.
                    </p>
                    <Link to={LOGIN} className="tw-bg-blue-600 tw-text-white tw-px-10 tw-py-4 tw-rounded-xl tw-text-lg tw-font-semibold hover:tw-bg-blue-700 tw-transition-all hover:-tw-translate-y-0.5 tw-shadow-lg tw-shadow-blue-600/30 hover:tw-shadow-xl hover:tw-shadow-blue-600/40 tw-opacity-0 tw-animate-fade-in-up [animation-delay:400ms]">
                        Get Started
                    </Link>
                </div>
            </section>

            {/* Feature Showcase */}
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
                {
                    width >= LG_BREAKPOINT ? 
                    <MultiCardCarousel setShowImageOverlay={(index: number) => {
                        setShowImageOverlay({id: additionalFeatures[index].id, show: true})
                    }} index={carouselIndex} items={createImageCarouselElements(additionalFeatures.map((feature: Feature) => {
                        return {
                            id: feature.id,
                            title: feature.title,
                            imageURL: feature.imageURL,
                            description: feature.description
                        }
                    }))} itemsPerPage={1}/>
                    : null
                }
                <div className="tw-grid md:tw-grid-cols-3 tw-gap-8">
                    {additionalFeatures.map((feature) => (
                        <button disabled={width < LG_BREAKPOINT} onClick={() => {
                            if (width >= LG_BREAKPOINT){
                                const element = additionalFeatures.find((feat: Feature) => feature.id === feat.id)
                                if (element){
                                    setCarouselIndex(additionalFeatures.indexOf(element))
                                }
                            }
                        }} key={`additional-feature-${feature.id}`} className="tw-flex tw-flex-col tw-gap-y-2 tw-text-left tw-bg-white tw-p-8 tw-rounded-xl tw-border tw-border-gray-200 hover:tw-shadow-xl hover:tw-shadow-blue-600/40">
                            <div className="tw-flex tw-flex-row tw-items-center tw-gap-x-4">
                                <div className="tw-flex-shrink-0 tw-flex tw-items-center tw-justify-center tw-rounded-full tw-w-10 tw-h-10 tw-bg-gradient-dark">{feature.icon}</div>
                                <h3 className="tw-text-xl tw-font-mono tw-font-semibold">{feature.title}</h3>
                            </div>
                            <p className="tw-text-gray-600 tw-leading-relaxed">{feature.description}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className= "tw-bg-gradient-dark tw-text-white tw-py-20 tw-px-6 tw-my-24 tw-text-center">
                <SubHeader textColor={"tw-white"}>Ready to streamline your workflow?</SubHeader>
                <p className="tw-text-xl tw-mb-8 tw-opacity-90">Join teams who are shipping faster with Kanban</p>
                <Link to={LOGIN} className="tw-bg-white tw-text-blue-600 tw-px-10 tw-py-4 tw-rounded-xl tw-text-lg tw-font-semibold hover:tw-shadow-2xl hover:tw-shadow-white/30 tw-transition-all">
                    Get Started Free
                </Link>
            </section>

            {
             	width >= LG_BREAKPOINT ? 
	             <ImageOverlay imageUrl={[...features, ...additionalFeatures].find((feature: Feature) => feature.id === showImageOverlay.id)?.imageURL ?? ""} isOpen={showImageOverlay.show} onClose={() => setShowImageOverlay({id: 0, show: false})}/>
	             : null
            }
        </div>
    );
}
