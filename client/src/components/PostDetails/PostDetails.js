import { CircularProgress, Divider, Paper, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPostBySearch, getPost } from "../../actions/post";
import moment from "moment";
import CommentSection from "../Comment/CommentSection";

const PostDetails = () => {
  const { post, posts, isLoading } = useSelector((state) => state.posts);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getPost(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (post) {
      dispatch(fetchPostBySearch("", post.tags.join(","), 1));
    }
  }, [post, dispatch]);

  if (isLoading) {
    return (
      <Paper
        elevation={6}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          borderRadius: "15px",
          height: "39vh",
        }}
      >
        <CircularProgress size="7em" />
      </Paper>
    );
  }

  if (!post) {
    return null;
  }

  const openPost = (id) => {
    navigate(`/posts/${id}`);
  };

  const recommendedPosts = posts.filter(({ _id }) => _id !== post._id);

  return (
    <Paper
      style={{ padding: "20px", borderRadius: "15px", margin: "8px" }}
      elevation={6}
    >
      <div
        sx={{
          display: "flex",
          width: "100%",
        }}
      >
        <div sx={{ borderRadius: "20px", margin: "10px", flex: 1 }}>
          <Typography variant="h3" component="h2">
            {post.title}
          </Typography>
          <Typography
            gutterBottom
            variant="h6"
            color="textSecondary"
            component="h2"
          >
            {post.tags.map((tag) => `#${tag} `)}
          </Typography>
          <Typography gutterBottom variant="body1" component="p">
            {post.message}
          </Typography>
          <Typography variant="h6">Created by: {post.name}</Typography>
          <Typography variant="body1">
            {moment(post.createdAt).fromNow()}
          </Typography>
          <Divider style={{ margin: "20px 0" }} />
          <Typography variant="body1">
            <strong>Realtime Chat - coming soon!</strong>
          </Typography>
          <Divider style={{ margin: "20px 0" }} />
          <CommentSection post={post} />
          <Divider style={{ margin: "20px 0" }} />
        </div>
        <div sx={{ marginLeft: "20px" }}>
          <img
            sx={{
              borderRadius: "20px",
              objectFit: "cover",
              width: "100%",
              maxHeight: "600px",
            }}
            src={
              post.selectedFile ||
              "https://user-images.githubusercontent.com/194400/49531010-48dad180-f8b1-11e8-8d89-1e61320e1d82.png"
            }
            alt={post.title}
          />
        </div>
      </div>

      {!!recommendedPosts.length && (
        <div sx={{ borderRadius: "20px", margin: "10px", flex: 1 }}>
          <Typography gutterBottom variant="h5">
            You might also like:
          </Typography>
          <Divider />
          <div sx={{ display: "flex" }}>
            {recommendedPosts.map(
              ({ title, name, message, likes, selectedFile, _id }) => (
                <div
                  style={{
                    margin: "16px",
                    cursor: "pointer",
                    border: "2px solid grey",
                    padding: "8px",
                  }}
                  onClick={() => openPost(_id)}
                  key={_id}
                >
                  <Typography gutterBottom variant="h6">
                    {title}
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    {name}
                  </Typography>
                  <Typography gutterBottom variant="body2">
                    {message.length < 40
                      ? message
                      : message.substring(0, 40) + "..."}
                  </Typography>
                  <Typography gutterBottom variant="subtitle1">
                    Likes: {likes.length}
                  </Typography>
                  <img src={selectedFile} width="200px" alt="selected-file" />
                </div>
              )
            )}
          </div>
        </div>
      )}
    </Paper>
  );
};

export default PostDetails;
