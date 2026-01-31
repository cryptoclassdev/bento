const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  displayName: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },

  profiles: [
    {
      type: {
        type: String,
        required: true,
        enum: ['socialLink', 'text', 'map', 'image', 'title', 'links', 'tokenPrice', 'contractAddress', 'dexLink'],
      },
      id: {
        type: String,
        required: true,
      },
      baseUrl: {
        type: String,
        required: function () {
          return this.type === 'socialLink' || this.type === 'links';
        },
      },
      userName: {
        type: String,
        required: function () {
          return this.type === 'socialLink';
        },
      },
      logo: {
        type: String,
        required: function () {
          return this.type === 'socialLink';
        },
      },
      bgColor: {
        type: String,
        required: function () {
          return this.type === 'socialLink';
        },
      },

      hostname: {
        type: String,
      },

      link: {
        type: String,
      },

      content: {
        type: String,
        default: '',
        required: false,
        // validate: {
        //   validator: function (v) {
        //     return this.type === 'text' || this.type === 'title'
        //       ? v.length >= 0
        //       : true;
        //   },
        //   message: 'Content is required for text and title types',
        // },
      },
      location: {
        type: {
          latitude: {
            type: Number,
            required: function () {
              return this.type === 'map';
            },
          },
          longitude: {
            type: Number,
            required: function () {
              return this.type === 'map';
            },
          },
          zoom: {
            type: Number,
            required: function () {
              return this.type === 'map';
            },
          },
        },
        required: function () {
          return this.type === 'map';
        },
      },
      imgUrl: {
        type: String,
        required: function () {
          return this.type === 'image';
        },
      },

      height: {
        type: Number,
      },
      width: {
        type: Number,
      },
      tokenId: {
        type: String,
      },
      contractAddress: {
        type: String,
      },
      chain: {
        type: String,
      },
      address: {
        type: String,
      },
      dex: {
        type: String,
      },
      tokenAddress: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  ],
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
