import { MediaResType } from '@/app/ValidationSchemas/media.schema';
import http from '@/lib/http';

/** BE giới hạn 10 file / request (FilesInterceptor('files', 10)) */
const MAX_FILES_PER_REQUEST = 10;

export const mediaApiRequest = {
  upload: (formData: FormData) => {
    return http.post<MediaResType>('/media/image/upload', formData);
  },

  /**
   * Upload nhiều ảnh, tự chia lô 10 file/request.
   * Trước đây FE nhồi hết file vào 1 request -> chọn 4 ảnh là BE trả 400 "Unexpected field",
   * lỗi bị nuốt và form gửi lên URL blob: (ảnh hỏng).
   * Trả về danh sách URL đã upload, ném lỗi nếu bất kỳ lô nào thất bại.
   */
  uploadMany: async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];

    const urls: string[] = [];
    for (let start = 0; start < files.length; start += MAX_FILES_PER_REQUEST) {
      const chunk = files.slice(start, start + MAX_FILES_PER_REQUEST);
      const formData = new FormData();
      chunk.forEach((file) => formData.append('files', file));

      const res = await mediaApiRequest.upload(formData);
      const uploaded = res?.payload?.data ?? [];
      if (uploaded.length !== chunk.length) {
        throw new Error(
          `Upload ảnh thất bại (${uploaded.length}/${chunk.length} file)`,
        );
      }
      urls.push(...uploaded.map((item) => item.url));
    }
    return urls;
  },
};

export default mediaApiRequest;
