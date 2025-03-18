"use client"; // Prevents Next.js hydration errors

import React from "react";
import { Models } from "node-appwrite";
import { Link } from "lucide-react"; // If this is an icon, it's fine

import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";

const Card = ({ file }: { file: Models.Document }) => {
    return (
        <a href={file.url} target="_blank" rel="noopener noreferrer" className="file-card">
            <div className="flex justify-between">
                <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="!size-20"
                    imageClassName="!size-11"
                />
                <div className="flex flex-col items-end justify-between">
                    <span>Actions Dropdown</span>
                    <p className="body-1">{convertFileSize(file.size)}</p>
                </div>
            </div>

            <div className="file-card-details">
                <p className="subtitle-2 line-clamp-1">{file.name}</p>
            </div>

            {file.$createdAt && <FormattedDateTime date={file.$createdAt} className="body-2 text-light-100" />}

            {file.owner?.fullName && (
                <p className="caption line-clamp-1 text-light-20">By: {file.owner.fullName}</p>
            )}
        </a>
    );
};

export default Card;
