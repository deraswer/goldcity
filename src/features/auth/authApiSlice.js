import { apiSlice } from "../../app/api";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChallenge: builder.mutation({
      query: ({ walletAddress, chain }) => ({
        url: "/auth/challenge",
        method: "POST",
        body: { walletAddress, chain },
      }),
    }),
    verifySignature: builder.mutation({
      query: ({ walletAddress, signature, chain, key }) => ({
        url: "/auth/verify",
        method: "POST",
        body: { walletAddress, signature, chain, key },
      }),
    }),
    getUserProfile: builder.query({
      query: () => "/auth/profile",
      providesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetChallengeMutation,
  useVerifySignatureMutation,
  useGetUserProfileQuery,
  useLogoutMutation,
} = authApiSlice;
