import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "../../store" 
import { 
	BACKEND_BASE_URL, 
	PROJECT_URL, 
	PROJECT_BOARD_URL, 
} from "../../helpers/urls" 
import { CustomError, Project, Board, ListResponse } from "../../types/common" 
import { privateApi } from "../private"
import { parseURLParams } from "../../helpers/functions" 

export const projectApi = privateApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		getProjects: builder.query<ListResponse<Project>, {urlParams: Record<string, any>}>({
			query: ({urlParams}) => ({
				url: `${PROJECT_URL}`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Projects"]
		}),
		getProject: builder.query<Project, {id: number | string, urlParams: Record<string, any>}>({
			query: ({id, urlParams}) => ({
				url: `${PROJECT_URL}/${id}`,
				method: "GET",
				params: urlParams
			}),
			providesTags: ["Projects"]
		}),
		addProject: builder.mutation<Project, Omit<Project, "id" | "createdAt" | "organizationId" | "userId"> & { userId?: number }>({
			query: ({name, description, userId}) => ({
				url: PROJECT_URL,
				body: {
					name,
					description,
					user_id: userId
				},
				method: "POST",
			}),
			invalidatesTags: ["Projects"]
		}),
		updateProject: builder.mutation<void, Pick<Project, "id" | "name" | "description" | "imageUrl"> & { userId?: number }>({
			query: ({id, name, description, userId}) => ({
				url: `${PROJECT_URL}/${id}`,
				body: {
					name,
					description,
					user_id: userId
				},
				method: "PUT",
			}),
			invalidatesTags: ["Projects"]
		}),
		deleteProject: builder.mutation<void, number>({
			query: (id) => ({
				url: `${PROJECT_URL}/${id}`,
				method: "DELETE",
			}),
			invalidatesTags: ["Projects"]
		}),
		getProjectBoards: builder.query<ListResponse<Board>, {id: number, urlParams: Record<string, any>}>({
			query: ({id, urlParams}) => ({
				url: PROJECT_BOARD_URL(id),
				method: "GET",
				params: urlParams
			}),
			providesTags: ["ProjectBoards"],
		}),
		addProjectBoards: builder.mutation<{message: string}, {id: number, boardIds: Array<number>}>({
			query: ({id, boardIds}) => ({
				url: PROJECT_BOARD_URL(id),
				body: {
					board_ids: boardIds
				},
				method: "POST",
			}),
			invalidatesTags: ["Projects", "ProjectBoards"]
		}),
		deleteProjectBoards: builder.mutation<{message: string}, {id: number, boardIds: Array<number>}>({
			query: ({id, boardIds}) => ({
				url: PROJECT_BOARD_URL(id),
				method: "DELETE",
				body: {
					board_ids: boardIds
				}
			}),
			invalidatesTags: ["Projects", "ProjectBoards"]	
		}),
	}),
})

export const { 
	useGetProjectsQuery,
	useGetProjectQuery,
	useAddProjectMutation,
	useUpdateProjectMutation,
	useDeleteProjectMutation,
	useGetProjectBoardsQuery,
	useAddProjectBoardsMutation,
	useDeleteProjectBoardsMutation,
} = projectApi 
