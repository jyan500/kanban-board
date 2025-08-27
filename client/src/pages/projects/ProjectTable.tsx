import React, { useState } from 'react';
import { Table } from "../../components/Table"
import { Board } from "../../types/common"
import { useProjectConfig } from "../../helpers/table-config/useProjectConfig"
import { IconArrowDown } from "../../components/icons/IconArrowDown"
import { IconArrowRight } from "../../components/icons/IconArrowRight"
import { useGetProjectsQuery } from "../../services/private/project"

// Type definitions
interface KanbanBoard {
    id: string;
    name: string;
    description: string;
    cardCount: number;
    lastModified: string;
}

interface Project {
    id: string;
    name: string;
    createdAt: string;
    userId: string;
    kanbanBoards: KanbanBoard[];
}

export const ProjectTable = () => {
    const config = useProjectConfig()
    const { data, isLoading, isFetching, isError } = useGetProjectsQuery({})
    return (
        <Table config={config} data={data?.data ?? []} tableKey={"projects"}/>
    )
}
// export const ProjectTable = () => {
// 	// Sample data
// 	const projects: Project[] = [
// 	    {
// 	        id: '1',
// 	        name: 'E-commerce Platform',
// 	        createdAt: '2024-01-15',
// 	        userId: 'user123',
// 	        kanbanBoards: [
// 	            {
// 	                id: 'kb1',
// 	                name: 'Development Sprint',
// 	                description: 'Main development tasks',
// 	                cardCount: 12,
// 	                lastModified: '2024-08-20'
// 	            },
// 	            {
// 	                id: 'kb2',
// 	                name: 'Bug Tracking',
// 	                description: 'Issues and bug reports',
// 	                cardCount: 5,
// 	                lastModified: '2024-08-19'
// 	            }
// 	        ]
// 	    },
// 	    {
// 	        id: '2',
// 	        name: 'Mobile App',
// 	        createdAt: '2024-02-10',
// 	        userId: 'user456',
// 	        kanbanBoards: [
// 	            {
// 	                id: 'kb3',
// 	                name: 'UI/UX Design',
// 	                description: 'Design and user experience tasks',
// 	                cardCount: 8,
// 	                lastModified: '2024-08-21'
// 	            },
// 	            {
// 	                id: 'kb4',
// 	                name: 'Testing',
// 	                description: 'QA and testing board',
// 	                cardCount: 15,
// 	                lastModified: '2024-08-18'
// 	            },
// 	            {
// 	                id: 'kb5',
// 	                name: 'Release Planning',
// 	                description: 'Release coordination',
// 	                cardCount: 3,
// 	                lastModified: '2024-08-17'
// 	            }
// 	        ]
// 	    },
// 	    {
// 	        id: '3',
// 	        name: 'Marketing Website',
// 	        createdAt: '2024-03-05',
// 	        userId: 'user789',
// 	        kanbanBoards: [
// 	            {
// 	                id: 'kb6',
// 	                name: 'Content Creation',
// 	                description: 'Blog posts and marketing content',
// 	                cardCount: 7,
// 	                lastModified: '2024-08-22'
// 	            }
// 	        ]
// 	    }
// 	];

//     const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

//     const toggleRow = (projectId: string) => {
//         const newExpandedRows = new Set(expandedRows);
//         if (newExpandedRows.has(projectId)) {
//             newExpandedRows.delete(projectId);
//         } else {
//             newExpandedRows.add(projectId);
//         }
//         setExpandedRows(newExpandedRows);
//     };

//     return (
//         <div className="tw-w-full tw-max-w-6xl tw-mx-auto tw-p-4">
//             <h2 className="tw-text-2xl tw-font-bold tw-mb-4">Projects with Kanban Boards</h2>
            
//             <div className="tw-overflow-x-auto tw-shadow-lg tw-rounded-lg">
//                 <table className="tw-w-full tw-bg-white">
//                     <thead className="tw-bg-gray-50 tw-border-b tw-border-gray-200">
//                         <tr>
//                             <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
//                                 Project
//                             </th>
//                             <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
//                                 Created At
//                             </th>
//                             <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
//                                 User ID
//                             </th>
//                             <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
//                                 Boards
//                             </th>
//                             <th className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
//                                 Actions
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
//                         {projects.map((project) => (
//                             <React.Fragment key={project.id}>
//                                 {/* Primary Row */}
//                                 <tr className="tw-hover:bg-gray-50 tw-transition-colors tw-duration-200">
//                                     <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
//                                         <div className="tw-text-sm tw-font-medium tw-text-gray-900">
//                                             {project.name}
//                                         </div>
//                                     </td>
//                                     <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
//                                         <div className="tw-text-sm tw-text-gray-500">
//                                             {new Date(project.createdAt).toLocaleDateString()}
//                                         </div>
//                                     </td>
//                                     <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
//                                         <div className="tw-text-sm tw-text-gray-500">
//                                             {project.userId}
//                                         </div>
//                                     </td>
//                                     <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
//                                         <span className="tw-inline-flex tw-items-center tw-px-2.5 tw-py-0.5 tw-rounded-full tw-text-xs tw-font-medium tw-bg-blue-100 tw-text-blue-800">
//                                             {project.kanbanBoards.length} board{project.kanbanBoards.length !== 1 ? 's' : ''}
//                                         </span>
//                                     </td>
//                                     <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
//                                         <button
//                                             onClick={() => toggleRow(project.id)}
//                                             className="tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-duration-200"
//                                         >
//                                             {expandedRows.has(project.id) ? (
//                                                 <>
//                                                     <IconArrowDown className="tw-h-4 tw-w-4 tw-mr-1" />
//                                                     Hide Boards
//                                                 </>
//                                             ) : (
//                                                 <>
//                                                     <IconArrowRight className="tw-h-4 tw-w-4 tw-mr-1" />
//                                                     Show Boards
//                                                 </>
//                                             )}
//                                         </button>
//                                     </td>
//                                 </tr>

//                                 {/* Secondary Rows (Kanban Boards) */}
//                                 {expandedRows.has(project.id) && (
//                                     <>
//                                         {/* Sub-header row */}
//                                         <tr className="tw-bg-gray-100">
//                                             <td className="tw-px-12 tw-py-2 tw-text-xs tw-font-semibold tw-text-gray-600 tw-uppercase tw-tracking-wider">
//                                                 Board Name
//                                             </td>
//                                             <td className="tw-px-6 tw-py-2 tw-text-xs tw-font-semibold tw-text-gray-600 tw-uppercase tw-tracking-wider">
//                                                 Description
//                                             </td>
//                                             <td className="tw-px-6 tw-py-2 tw-text-xs tw-font-semibold tw-text-gray-600 tw-uppercase tw-tracking-wider">
//                                                 Cards
//                                             </td>
//                                             <td className="tw-px-6 tw-py-2 tw-text-xs tw-font-semibold tw-text-gray-600 tw-uppercase tw-tracking-wider">
//                                                 Last Modified
//                                             </td>
//                                             <td className="tw-px-6 tw-py-2"></td>
//                                         </tr>
                                        
//                                         {project.kanbanBoards.map((board) => (
//                                             <tr key={board.id} className="tw-bg-gray-50 hover:tw-bg-gray-100 tw-transition-colors tw-duration-200">
//                                                 <td className="tw-px-12 tw-py-3 tw-whitespace-nowrap">
//                                                     <div className="tw-flex tw-items-center">
//                                                         <div className="tw-h-2 tw-w-2 tw-bg-indigo-500 tw-rounded-full tw-mr-3"></div>
//                                                         <div className="tw-text-sm tw-font-medium tw-text-gray-900">
//                                                             {board.name}
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="tw-px-6 tw-py-3">
//                                                     <div className="tw-text-sm tw-text-gray-500 tw-max-w-xs tw-truncate">
//                                                         {board.description}
//                                                     </div>
//                                                 </td>
//                                                 <td className="tw-px-6 tw-py-3 tw-whitespace-nowrap">
//                                                     <span className="tw-inline-flex tw-items-center tw-px-2 tw-py-1 tw-rounded-full tw-text-xs tw-font-medium tw-bg-green-100 tw-text-green-800">
//                                                         {board.cardCount}
//                                                     </span>
//                                                 </td>
//                                                 <td className="tw-px-6 tw-py-3 tw-whitespace-nowrap">
//                                                     <div className="tw-text-sm tw-text-gray-500">
//                                                         {new Date(board.lastModified).toLocaleDateString()}
//                                                     </div>
//                                                 </td>
//                                                 <td className="tw-px-6 tw-py-3 tw-whitespace-nowrap">
//                                                     <button className="tw-text-indigo-600 hover:tw-text-indigo-900 tw-text-sm tw-font-medium">
//                                                         View Board
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </>
//                                 )}
//                             </React.Fragment>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };
