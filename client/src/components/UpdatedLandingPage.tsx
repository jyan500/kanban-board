import React from 'react';

export const UpdatedLandingPage = () => {
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
            <section className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-my-32">
                <div className="tw-grid md:tw-grid-cols-2 tw-gap-16 tw-items-center">
                    <div>
                        <h2 className="tw-font-mono tw-text-5xl tw-font-bold tw-mb-4 tw-text-gray-900">Manage projects end-to-end</h2>
                        <p className="tw-text-lg tw-text-gray-600 tw-leading-relaxed tw-mb-6">
                            Edit tickets with a sleek inline modal featuring rich text support. Make quick updates without losing context or breaking your flow.
                        </p>
                    </div>
                    <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-blue-100 tw-rounded-2xl tw-p-8 tw-shadow-lg tw-shadow-blue-600/10">
                        <div className="tw-w-full tw-h-72 tw-bg-white tw-rounded-xl tw-border-2 tw-border-gray-200 tw-flex tw-items-center tw-justify-center tw-text-blue-600 tw-font-semibold">
                            Inline Editor Preview
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Showcase 2 */}
            <section className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-my-32">
                <div className="tw-grid md:tw-grid-cols-2 tw-gap-16 tw-items-center">
                    <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-blue-100 tw-rounded-2xl tw-p-8 tw-shadow-lg tw-shadow-blue-600/10 md:tw-order-first">
                        <div className="tw-w-full tw-h-72 tw-bg-white tw-rounded-xl tw-border-2 tw-border-gray-200 tw-flex tw-items-center tw-justify-center tw-text-blue-600 tw-font-semibold">
                        </div>
                    </div>
                    <div>
                        <h2 className="tw-font-mono tw-text-5xl tw-font-bold tw-mb-4 tw-text-gray-900">
                            Easy Issue Tracking
                        </h2>
                        <p className="tw-text-lg tw-text-gray-600 tw-leading-relaxed tw-mb-6">
                            Organize work efficiently with parent-child and linked issues. Connect related tasks to see the full picture and manage dependencies effortlessly.
                        </p>
                    </div>
                </div>
            </section>

            {/* Feature Showcase 3 */}
            <section className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-my-32">
                <div className="tw-grid md:tw-grid-cols-2 tw-gap-16 tw-items-center">
                    <div>
                        <h2 className="tw-font-mono tw-text-5xl tw-font-bold tw-mb-4 tw-text-gray-900">Plan, Collaborate, Launch</h2>
                        <p className="tw-text-lg tw-text-gray-600 tw-leading-relaxed tw-mb-6">
                            Flexible board display with grouping and drag-and-drop statuses. Customize your workflow to match how your team actually works.
                        </p>
                    </div>
                    <div className="tw-bg-gradient-to-br tw-from-blue-50 tw-to-blue-100 tw-rounded-2xl tw-p-8 tw-shadow-lg tw-shadow-blue-600/10">
                        <div className="tw-w-full tw-h-72 tw-bg-white tw-rounded-xl tw-border-2 tw-border-gray-200 tw-flex tw-items-center tw-justify-center tw-text-blue-600 tw-font-semibold">
                            Kanban Board Preview
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-my-24">
                <div className="tw-text-center tw-mb-16">
                    <h2 className="tw-font-mono tw-text-5xl tw-font-bold tw-mb-4">Everything you need to ship</h2>
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
                <h2 className="tw-text-5xl tw-font-bold tw-mb-4">Ready to streamline your workflow?</h2>
                <p className="tw-text-xl tw-mb-8 tw-opacity-90">Join teams who are shipping faster with Kanban</p>
                <button className="tw-bg-white tw-text-blue-600 tw-px-10 tw-py-4 tw-rounded-xl tw-text-lg tw-font-semibold hover:-tw-translate-y-0.5 hover:tw-shadow-2xl hover:tw-shadow-white/30 tw-transition-all">
                    Get Started Free
                </button>
            </section>
        </div>
    );
}