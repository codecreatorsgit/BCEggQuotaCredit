import { sp } from "@pnp/sp/presets/all"; // PnPjs for SharePoint operations 
export class ApiService {

  constructor(context: any) {
    // Initialize PnPjs with the context 
    sp.setup({
      spfxContext: context,
    });

  }

  // Method to get items from a SharePoint list 
  public async getListItems(listName: string, selectColumns: string): Promise<any[]> {
    try {
      const items = await sp.web.lists.getByTitle(listName).items.select(selectColumns).get();
      return items;
    } catch (error) {
      console.error("Error fetching list items:", error);
      throw error; // Re-throw the error for handling in the calling component 
    }
  }


  public async getListItemsWithExpand(listName: string, selectColumns: string, expand: string): Promise<any[]> {
    try {
      const items = await sp.web.lists.getByTitle(listName).items.select(selectColumns).expand(expand).get();
      return items;
    }
    catch (error) {
      console.error("Error fetching list items:", error);
      throw error; // Re-throw the error for handling in the calling component 
    }
  }

  public async filterListItems(listName: string, filter: string, selectColumns: string): Promise<any[]> {
    try {
      const items = await sp.web.lists.getByTitle(listName).items.select(selectColumns).filter(filter).get();
      return items;
    }
    catch (error) {
      console.error("Error fetching list items:", error);
      throw error; // Re-throw the error for handling in the calling component 
    }
  }

  public async filterListItemsWithExpand(listName: string, filter: string, selectColumns: string, expand: string): Promise<any[]> {
    try {
      const items = await sp.web.lists.getByTitle(listName).items.select(selectColumns).filter(filter).expand(expand).get();
      return items;
    }
    catch (error) {
      console.error("Error fetching list items:", error);
      throw error; // Re-throw the error for handling in the calling component 
    }
  }

  public async getListItemsWithId(id: number, listName: string, selectColumns: string, expand: string): Promise<any[]> {
    try {
      if (id > 0) {
        const items = await sp.web.lists.getByTitle(listName).items.getById(id).select(selectColumns).expand(expand).get();
        return items;
      }
      return [];
    }
    catch (error) {
      console.error("Error fetching list items:", error);
      throw error; // Re-throw the error for handling in the calling component 
    }
  }

  public insertRecord = async (listName: string, objectToAdd: any): Promise<Number> => {
    let object = await sp.web.lists.getByTitle(listName).items.add(objectToAdd).then(data => {
      console.log("Success" + data);
      return data.data.ID;
    }).catch(error => {
      console.log("Error" + error);
    });
    return object;
  }

  public updateRecord = async (id: any, listName: string, objectToUpdate: any) => {
    return await sp.web.lists.getByTitle(listName).items.getById(id).update(objectToUpdate).then(data => {
      console.log("Success" + data);
    }).catch(error => {
      console.log("Error" + error);
    });
  }

  public getItembyId = async (id: any, listName: string, select: string) => {
    return await sp.web.lists.getByTitle(listName).items.select(select).getById(id).get();

  }

  public deleteRecord = async (id: any, listName: string) => {
    try {
      return await sp.web.lists.getByTitle(listName).items.getById(id).delete();

    } catch (error) {
      console.log("Error" + error);
    }
  }
public deleteRecords = async (listName: string,filter:string) => {
    try {
      const items = await sp.web.lists.getByTitle(listName).items.filter(filter).get();

    for (const item of items) {
      await sp.web.lists.getByTitle(listName).items.getById(item.Id).delete();
    }


    } catch (error) {
      console.log("Error" + error);
    }
  }
  public addFolder = async (url: string) => {
    try {
      const folderAddResult = await sp.web.folders.addUsingPath(url);
      return folderAddResult;

    } catch (error) {
      console.log("Error" + error);
    }
  }

  public copyFiles = async (destinationUrl: string, sourceUrl: string) => {
    try {

      await sp.web.getFileByServerRelativePath(sourceUrl).copyTo(destinationUrl, false);

    } catch (error) {
      console.log("Error" + error);
    }
  }

  public getFiles = async (sourceUrl: string): Promise<any> => {
    try {

      var file = await sp.web.getFileByServerRelativePath(sourceUrl).getItem();
      console.log(file.data);
      return file;

    } catch (error) {
      console.log("Error" + error);

    }
  }

  public addFiles = async (fileNamePath: string, file: any, destinationUrl: string) => {
    try {
      const fileContent = await file.arrayBuffer();
      await sp.web.getFolderByServerRelativePath(destinationUrl).files.add(fileNamePath, fileContent, true);

    } catch (error) {
      console.log("Error" + error);
    }
  }

  public addFileWithMetadata = async (listName: string, fileName: string, file: any, metadata: any) => {
    try {
      const fileContent = await file.arrayBuffer();

      const result = await sp.web.lists.getByTitle(listName).rootFolder.files.addUsingPath(
        fileName,
        fileContent,
        { Overwrite: true }
      );

      const listItem = await result.file.listItemAllFields.get();
      await sp.web.lists.getByTitle(listName).items.getById(listItem.Id).update(metadata);
      const updatedItem = await sp.web.lists.getByTitle(listName).items.getById(listItem.Id)
        .select("*")
        .get();

      return {
        success: true,
        id: listItem.Id,
        item: updatedItem,
        fileInfo: {
          name: fileName,
          serverRelativeUrl: result.data.ServerRelativeUrl
        }
      };

    } catch (error) {
      console.log("Error:", error);
      return {
        success: false,
        error: error.message || error
      };
    }
  };

  public async updateFolder(currentPath: string, newName: string): Promise<void> {
    try {
      const newPath = currentPath.substring(0, currentPath.lastIndexOf("/")) + "/" + newName;
      await sp.web.getFolderByServerRelativeUrl(currentPath).moveByPath(newPath);

      console.log(`Folder renamed to: ${newPath}`);
    } catch (error) {
      console.log("Error renaming folder: ", error);
    }
  }

  public async getCurrentUser(): Promise<any> {
    try {
      return await sp.web.currentUser.get();
    } catch (error) {
      console.log("Error renaming folder: ", error);
    }
  }

  public async getSiteUser(): Promise<any> {
    try {
      return await sp.web.siteUsers.get();
    } catch (error) {
      console.log("Error renaming folder: ", error);
    }
  }
  public async getFolderFilePaths(folderServerRelativeUrl: string): Promise<{ Name: string; ServerRelativeUrl: string }[]> {
    try {
      const files = await sp.web.getFolderByServerRelativePath(folderServerRelativeUrl)
        .files
        .select("*")();
      return files;
    } catch (error) {
      console.error("Error retrieving file paths:", error);
      return [];
    }
  }


} 