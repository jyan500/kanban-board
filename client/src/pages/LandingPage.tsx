import React, {useState, useRef} from "react"
import { useNavigate } from "react-router-dom"
import { IconBell } from "../components/icons/IconBell"
import { IconGear } from "../components/icons/IconGear"
import { IconClipboardList } from "../components/icons/IconClipboardList"
import { IconTree } from "../components/icons/IconTree"
import { IconTextArea } from "../components/icons/IconTextArea"
import { IconComment } from "../components/icons/IconComment"
import { IconBulkAction } from "../components/icons/IconBulkAction"
import { IconDragDrop } from "../components/icons/IconDragDrop"
import { REGISTER } from "../helpers/routes"
import { useScreenSize } from "../hooks/useScreenSize"
import { FADE_ANIMATION, LG_BREAKPOINT} from "../helpers/constants"
import { MultiCardCarousel } from "../components/page-elements/MultiCardCarousel"
import { ImageOverlay } from "../components/page-elements/ImageOverlay"
import BacklogImage from "../assets/images/landing-page/backlog.png"
import BulkActionsImage from "../assets/images/landing-page/bulk-actions.png"
import EpicTicketsImage from "../assets/images/landing-page/epic-tickets.png"
import GroupByImage from "../assets/images/landing-page/group-by.png"
import MentionsImage from "../assets/images/landing-page/mentions.png"
import NotificationsImage from "../assets/images/landing-page/notifications.png"
import SettingsImage from "../assets/images/landing-page/organization-settings.png"
import RTEImage from "../assets/images/landing-page/rich-text-editing.png"

interface Feature {
	id: number
	title: string
	description: string
	icon?: React.ReactNode
	imageURL: string
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
	        <img src={data.imageURL} alt={data.title} className="tw-relative tw-object-cover tw-w-full tw-h-full tw-rounded-lg" />
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

const iconClass = "tw-mt-1 tw-shrink-0 tw-h-6 tw-w-6"

const features: Array<Feature> = [
	{
		id: 1,
		title: "Inline Ticket Editing",
		description: "Edit tickets with a sleek inline modal featuring rich text support.",
		icon: <IconTextArea className={`${iconClass} tw-text-blue-500`} />,
		imageURL: RTEImage,
	},
	{
		id: 2,
		title: "Ticket Linking & Epics",
		description: "Organize work efficiently with parent-child and linked issues.",
		icon: <IconTree className={`${iconClass} tw-text-green-500`} />,
		imageURL: EpicTicketsImage,
	},
	{
		id: 3,
		title: "Group by & Drag-and-Drop",
		description: "Flexible board display with grouping and drag-and-drop statuses.",
		icon: <IconDragDrop className={`${iconClass} tw-text-yellow-500`} />,
		imageURL: GroupByImage,
	},
	{
		id: 4,
		title: "Mentions & Comments",
		description: "Tag teammates in rich text comments and descriptions.",
		icon: <IconComment className={`${iconClass} tw-text-purple-500`} />,
		imageURL: MentionsImage,
	},
	{
		id: 5,
		title: "Bulk Actions",
		description: "Apply actions to multiple tickets to optimize your workflow.",
		icon: <IconBulkAction className = {`${iconClass} tw-text-blue-500`}/>,
		imageURL: BulkActionsImage,
	},
	{
		id: 6,
		title: "Backlog & Issue Tracking",
		description: "Track upcoming work and stay on top of the backlog.",
		icon: <IconClipboardList className={`${iconClass} tw-w-6 tw-text-red-500`} />,
		imageURL: BacklogImage,
	},
	{
		id: 7,
		title: "Notifications",
		description: "Stay informed with smart, real-time notifications.",
		icon: <IconBell className={`${iconClass} tw-text-indigo-500`} />,
		imageURL: NotificationsImage,
	},
	{
		id: 8,
		title: "Organization & User Settings",
		description: "Manage your organization and personal preferences easily.",
		icon: <IconGear className="tw-shrink-0 tw-h-6 tw-w-6 tw-text-gray-500" />,
		imageURL: SettingsImage,
	},
];

interface CardProps {
    children: React.ReactNode
    className?: string
    onClick: () => void
    disabled: boolean
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick, disabled }) => {
    return (
        <button disabled={disabled} onClick={onClick} className={`${!disabled ? "hover:tw-opacity-60" : ""} tw-rounded-2xl tw-shadow-sm tw-border tw-bg-white ${className}`}>
            {children}
        </button>
    )
}

interface CardContentProps {
    children: React.ReactNode
    className?: string
}

const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
    return <div className={`tw-p-4 ${className}`}>{children}</div>;
}

export interface ShowImageOverlay {
	index: number
	show: boolean
}

export const LandingPage = () => {
	const navigate = useNavigate()
	const {width, height} = useScreenSize()
	const [carouselIndex, setCarouselIndex] = useState(0)
	const [showImageOverlay, setShowImageOverlay] = useState<ShowImageOverlay>({
		index: 0,
		show: false
	})
	const scrollToRef = useRef<HTMLDivElement | null>(null)
	return (
        <main className="tw-px-6 tw-py-16">
            <div ref={scrollToRef} className="tw-max-w-4xl tw-mx-auto tw-text-center">
                <h2 className="tw-text-4xl tw-font-bold tw-mb-4">Project Management Made Easy</h2>
                <p className="tw-text-lg tw-text-gray-600 tw-mb-4">
                    Kanban helps startups and small teams stay agile without the overhead.
                </p>
                <button onClick={() => navigate(REGISTER)} className = {`${FADE_ANIMATION} hover:tw-opacity-60 tw-border-gray-300 tw-border tw-inline-block tw-p-2 tw-tw-text-lg tw-text-gray-600 tw-font-bold tw-mb-10`}>Get Started</button>
            </div>
            {
            	width >= LG_BREAKPOINT ? 
	            <MultiCardCarousel setShowImageOverlay={setShowImageOverlay} index={carouselIndex} items={createImageCarouselElements(features.map((feature: Feature) => {
					return {
						id: feature.id,
						title: feature.title,
						imageURL: feature.imageURL,
						description: feature.description
					}
				}))} itemsPerPage={1}/>
				: null
            }

            <div className="tw-grid md:tw-grid-cols-2 tw-gap-6 tw-max-w-5xl tw-mx-auto">
                {features.map((feature) => (
                    <Card disabled={width < LG_BREAKPOINT} key={`feature_${feature.id}`} className="tw-p-4" onClick={() => {
                    	setCarouselIndex(feature.id-1)
                    	scrollToRef?.current?.scrollIntoView({ behavior: 'smooth' })
                    }}>
                        <CardContent className="tw-flex tw-flex-col tw-gap-4 tw-items-center tw-justify-center">
                        	<div className = "tw-flex tw-flex-row tw-gap-x-4 tw-justify-center tw-items-start">
	                            {feature.icon}
	                            <h3 className="tw-mt-0 tw-text-xl tw-font-semibold tw-mb-1">{feature.title}</h3>
                            </div>
                            <div>
                                <p className="tw-text-sm tw-text-gray-600">{feature.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {
            	width >= LG_BREAKPOINT ? 
	            <ImageOverlay imageUrl={features.find((feature: Feature) => feature.id === showImageOverlay.index + 1)?.imageURL ?? ""} isOpen={showImageOverlay.show} onClose={() => setShowImageOverlay({index: showImageOverlay.index, show: false})}/>
	            : null
            }
        </main>
	)
}
