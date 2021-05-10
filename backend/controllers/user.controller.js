const Story = require('../models/stories');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;
// const API_KEY = process.env.API_KEY

const userLogin = async (req, res) => {
  try {
    const { username } = req.body;
    const token = jwt.sign({ username }, process.env.API_KEY, {
      expiresIn: '365d',
    });
    res.status(200).json({ token });
  } catch (err) {
    res.send('Error' + err);
  }
};

const getUserAssets = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { username } = jwt.verify(authorization, process.env.API_KEY);

    axios
      .get(
        `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${username}&page=1&limit=100&order=desc&sort=asset_id`
      )
      .then((response) => {
        const { data } = response.data;

        // For All Asset
        console.log(`All Asset of ${username}`);
        let arr = [];
        for (i = 0; i < data.length; i++) {
          asset = data[i];
          assetId = asset.asset_id;
          assetName = asset.name;

          temp = asset.data;
          assetImage = temp.img;
          console.log(i + 1);
          console.log('AssetImage: ', assetImage);
          console.log('AssetName: ', assetName);
          console.log('AssetId:', assetId);

          arr.push({
            AssetImage: assetImage,
            AssetName: assetName,
            AssetId: assetId,
          });
        }
        res.status(200).json(arr);
      });
  } catch (err) {
    res.send('Error' + err);
  }
};

const verifyUserAssets = async (req, res) => {
  const { authorization } = req.headers;
  const { username } = jwt.verify(authorization, process.env.API_KEY);
  storyId = req.params.id;

  try {
    const stories = await Story.findOne({ _id: storyId });

    const requiredAssetIds = stories.assetIds.split(',');

    assetIdDb = stories.assetIds;
    storyContent = stories.content;

    axios
      .get(
        `https://wax.api.atomicassets.io/atomicassets/v1/assets?owner=${username}&page=1&limit=100&order=desc&sort=asset_id`
      )
      .then((response) => {
        const { data } = response.data;

        let userAssetIds = [];

        for (i = 0; i < data.length; i++) {
          userAssetIds.push(data[i].asset_id);
        }

        let approvedAssets = [];
        let deniedAssets = [];
        for (i = 0; i < requiredAssetIds.length; i++) {
          if (userAssetIds.includes(requiredAssetIds[i])) {
            approvedAssets.push(requiredAssetIds[i]);
          } else {
            deniedAssets.push(requiredAssetIds[i]);
          }
        }

        if (approvedAssets.length < requiredAssetIds.length) {
          res.status(401).json({ deniedAssets });
        } else {
          res.status(200).json({ Story: storyContent });
        }
      });
  } catch (err) {
    res.send('Error' + err);
  }
};

module.exports = {
  userLogin,
  getUserAssets,
  verifyUserAssets,
};