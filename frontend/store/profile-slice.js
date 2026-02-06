import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isfirstTime: true,
  socialLinks: [
    {
      id: 'x',
      type: 'socialLink',
      baseUrl: 'x',
      userName: '',
      isFullUrl: false,
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z'/%3E%3C/svg%3E",
      bgColor: '#000000',
      isAdded: false,
    },
    {
      id: 'docs',
      type: 'socialLink',
      baseUrl: 'docs',
      userName: '',
      isFullUrl: true,
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6zm2-6h8v2H8v-2zm0-3h8v2H8v-2z'/%3E%3C/svg%3E",
      bgColor: '#4A5568',
      isAdded: false,
    },
    {
      id: 'github',
      type: 'socialLink',
      baseUrl: 'github',
      userName: '',
      isFullUrl: false,
      logo: 'https://res.cloudinary.com/dqlj6jlir/image/upload/v1715698955/logo/github_bpmxzd.svg',
      bgColor: '#181717',
      isAdded: false,
    },
    {
      id: 'officialsite',
      type: 'socialLink',
      baseUrl: 'officialsite',
      userName: '',
      isFullUrl: true,
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'/%3E%3C/svg%3E",
      bgColor: '#2B6CB0',
      isAdded: false,
    },
    {
      id: 'blog',
      type: 'socialLink',
      baseUrl: 'blog',
      userName: '',
      isFullUrl: true,
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z'/%3E%3C/svg%3E",
      bgColor: '#38A169',
      isAdded: false,
    },
    {
      id: 'token',
      type: 'socialLink',
      baseUrl: 'token',
      userName: '',
      isFullUrl: true,
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E",
      bgColor: '#D69E2E',
      isAdded: false,
    },
    {
      id: 'brandkit',
      type: 'socialLink',
      baseUrl: 'brandkit',
      userName: '',
      isFullUrl: true,
      logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1.01 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'/%3E%3C/svg%3E",
      bgColor: '#805AD5',
      isAdded: false,
    },
  ],
  profileDetails: [],
  name: '',
  bio: '',
  avatar: '',
  theme: 'light',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setFirstTime(state, action) {
      state.isfirstTime = action.payload;
    },

    updateSocialLinks(state, action) {
      const index = state.socialLinks.findIndex(
        (item) => item.id == action.payload.id
      );
      state.socialLinks[index] = action.payload;
    },

    addItem(state, action) {
      state.profileDetails.push(action.payload);
    },

    setProfileDetails(state, action) {
      state.profileDetails = action.payload;
    },

    removeItem(state, action) {
      const index = state.profileDetails.findIndex(
        (item) => item.id == action.payload
      );
      state.profileDetails.splice(index, 1);
    },

    updateItem(state, action) {
      const index = state.profileDetails.findIndex(
        (item) => item.id == action.payload.id
      );
      state.profileDetails[index] = action.payload;
    },

    removeSuggestion(state, action) {
      state.profileDetails = state.profileDetails.filter(
        (item) =>
          item?.content !== null ||
          item?.userName !== null ||
          item?.imgUrl !== null
      );
    },

    updateDisplayName(state, action) {
      state.name = action.payload;
    },

    updateBio(state, action) {
      state.bio = action.payload;
    },

    updateAvatar(state, action) {
      state.avatar = action.payload;
    },

    updateTheme(state, action) {
      state.theme = action.payload;
    },
  },
});

export const profileActions = profileSlice.actions;

export default profileSlice;
