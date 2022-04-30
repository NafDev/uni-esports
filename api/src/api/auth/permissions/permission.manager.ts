import Bitfield from 'bitfield';

export type EnumLike = Record<string, number>;

export class PermissionManager {
  private readonly permissionSize: number;

  constructor(permissionEnum: EnumLike) {
    if (typeof permissionEnum !== 'object') {
      throw new Error('Unrecognised enum');
    }

    const validation = {};
    let largestIndex = 0;
    const isNum = (str: string) => /^\d+$/.test(str);

    for (const [k, v] of Object.entries(permissionEnum)) {
      if (isNum(k) && typeof v === 'number') {
        validation[k] = v;
        largestIndex = largestIndex < v ? v : largestIndex;
      } else {
        throw new Error(`Invalid enum entry [${k},${v}] - expected [string,number]`);
      }
    }

    const enumLength = Object.keys(validation).length;
    if (largestIndex + 1 !== enumLength) {
      throw new Error(`Unexpected largest index value - expected = ${enumLength}, actual = ${largestIndex + 1}`);
    }

    this.permissionSize = enumLength;
  }

  /**
   * Converts permission attribute value to permission bitfield
   */
  permAttr2Bits(value: number): Bitfield {
    const bitStr = value.toString(2);
    const bitfield = new Bitfield(this.permissionSize);
    for (let i = 0; i < bitStr.length; i++) bitfield.set(bitStr.length - (i + 1), bitStr.charAt(i) === '1');
    return bitfield;
  }

  /**
   * Converts permission bitfield to permission attribute value
   */
  bits2PermAttr(bitfield: Bitfield): number {
    let binStr = '';
    for (let i = 0; i < this.permissionSize; i++) binStr = (bitfield.get(i) ? '1' : '0') + binStr;
    return parseInt(binStr, 2);
  }

  /**
   * Takes list of permissions and returns permission attribute value
   * @param permissions List of permissions for the user
   */
  createPermissionAttribute(...permissions: number[]): number {
    const bitfield = new Bitfield(this.permissionSize);
    for (const perm of permissions) bitfield.set(perm, true);
    return this.bits2PermAttr(bitfield);
  }

  /**
   * @param permissions Permissions of a user (attribute value or representative bitfield)
   * @param requiredPerms Permissions to check presence of within permission attribute
   */
  checkPermissions(permissions: number | Bitfield, ...requiredPerms: number[]) {
    if (typeof permissions === 'number') {
      const bitfield = this.permAttr2Bits(permissions);
      for (const perm of requiredPerms) if (!bitfield.get(perm)) return false;
    } else {
      for (const perm of requiredPerms) if (!permissions.get(perm)) return false;
    }

    return true;
  }

  /**
   * Modify an existing permission attribute
   * @param permAttr User's existing permission value
   * @param permsToAdd List of permissions to add
   * @param permsToRemove List of permissions to revoke
   * @returns New permission attribute
   */
  modifyPermissions(permAttr: number, permsToAdd?: number[], permsToRemove?: number[]) {
    const bitfield = this.permAttr2Bits(permAttr);

    if (permsToAdd) {
      for (const perm of permsToAdd) bitfield.set(perm, true);
    }

    if (permsToRemove) {
      for (const perm of permsToRemove) bitfield.set(perm, false);
    }

    return this.bits2PermAttr(bitfield);
  }
}
