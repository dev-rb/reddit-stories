import React from "react";
import { BsBookmark, BsBookmarkCheckFill, BsClock, BsClockFill, BsHeart, BsHeartFill } from "react-icons/bs";
import { PostStatus } from "src/server/routers/post";

const LIKE_ICON = <BsHeartFill />;
const FAVORITED_ICON = <BsBookmarkCheckFill />;
const READLATER_ICON = <BsClockFill />;

const UNLIKE_ICON = <BsHeart />;
const UNFAVORITED_ICON = <BsBookmark />;
const UNREADLATER_ICON = <BsClock />;

export const positiveStatusIconMap: { [key in PostStatus]: React.ReactNode } = {
    'liked': LIKE_ICON,
    'favorited': FAVORITED_ICON,
    'readLater': READLATER_ICON
}

export const negativeStatusIconMap: { [key in PostStatus]: React.ReactNode } = {
    'liked': UNLIKE_ICON,
    'favorited': UNFAVORITED_ICON,
    'readLater': UNREADLATER_ICON
}

const LIKE_TEXT = "Liked post."
const FAVORITED_TEXT = "Favorited post."
const READLATER_TEXT = "Marked post for read later."

const UNLIKE_TEXT = "Unliked post.";
const UNFAVORITED_TEXT = "Unfavorited post.";
const UNREADLATER_TEXT = "Unmarked post for read later.";

export const positiveStatusTextMap: { [key in PostStatus]: string } = {
    'liked': LIKE_TEXT,
    'favorited': FAVORITED_TEXT,
    'readLater': READLATER_TEXT
}

export const negativeStatusTextMap: { [key in PostStatus]: string } = {
    'liked': UNLIKE_TEXT,
    'favorited': UNFAVORITED_TEXT,
    'readLater': UNREADLATER_TEXT
}