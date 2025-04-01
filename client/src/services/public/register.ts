import { BaseQueryFn, FetchArgs, createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { BACKEND_BASE_URL, REGISTER_URL, RESEND_ACTIVATION_URL, ACTIVATE_ACCOUNT_URL, REGISTER_ORGANIZATION_USER_URL } from "../../helpers/urls" 
import { CustomError } from "../../types/common" 
import { publicApi } from "../public" 
import { OrgUserRegistrationForm } from "../../pages/register/OrganizationRegister"
import { FormValues as UserFormValues } from "../../components/forms/RegisterUserForm"
import { FormValues as OrganizationFormValues } from "../../components/OrganizationForm"

export interface Response {
	message: string
}

export interface RegisterRequest {
	firstName: string
	lastName: string
	email: string
	password: string
	confirmPassword: string
	organizationId: number
	recaptcha: string
}

export const userRegisterApi = publicApi.injectEndpoints({
	overrideExisting: false,
	endpoints: (builder) => ({
		userRegister: builder.mutation<Response, RegisterRequest>({
			query: (registrationInfo) => ({
				url: REGISTER_URL,
				method: "POST",
				body: {
					first_name: registrationInfo.firstName,
					last_name: registrationInfo.lastName,
					email: registrationInfo.email,
					password: registrationInfo.password,
					confirm_password: registrationInfo.confirmPassword,
					organization_id: registrationInfo.organizationId,
					recaptcha: registrationInfo.recaptcha,
				} 
			})	
		}),
		// TODO: update the request type to be the concatenation of the user register request and the organization request
		organizationUserRegister: builder.mutation<{message: string}, OrgUserRegistrationForm>({
			query: ({organization, user}) => {
				const orgBody = (organization: OrganizationFormValues) => {
					const { name, email, address, city, state, zipcode, industry, phoneNumber: phone_number } = organization
					return {
						name, email, address, city, state, zipcode, phone_number, industry
					}
				}
				const userBody = (user: UserFormValues) => {
					const { firstName: first_name, lastName: last_name, email, password, confirmPassword: confirm_password, recaptcha } = user
					return {
						first_name, last_name, email, password, confirm_password, recaptcha
					}
				}
				return {
					url: `${REGISTER_ORGANIZATION_USER_URL}`,
					method: "POST",
					body: {
						"organization": orgBody(organization),
						"user": userBody(user)
					}
				}
			}
		}),
		resendActivation: builder.mutation<{message: string}, {token: string}>({
			query: ({token}) => {
				return {
					url: RESEND_ACTIVATION_URL,
					method: "POST",
					body: {
						token
					}
				}
			}
		}),
		activateAccount: builder.mutation<{message: string}, {token: string}>({
			query: ({token}) => {
				return {
					url: ACTIVATE_ACCOUNT_URL,
					method: "POST",
					body: {
						token
					}
				}
			},
		}),
	}),
})

export const { useUserRegisterMutation, useOrganizationUserRegisterMutation, useActivateAccountMutation, useResendActivationMutation } = userRegisterApi
