$cs = @'
using System;
using System.IO;
using System.IO.Compression;

public class Png {
    static uint[] ct = new uint[256];
    static Png() {
        for (int i = 0; i < 256; i++) {
            uint c = (uint)i;
            for (int j = 0; j < 8; j++) c = (c & 1) != 0 ? (0xEDB88320 ^ (c >> 1)) : (c >> 1);
            ct[i] = c;
        }
    }
    static uint CRC(byte[] d) {
        uint c = 0xFFFFFFFF;
        for (int i = 0; i < d.Length; i++) c = (c >> 8) ^ ct[(c ^ d[i]) & 0xFF];
        return c ^ 0xFFFFFFFF;
    }
    static byte[] BE(uint v) { byte[] b = BitConverter.GetBytes(v); Array.Reverse(b); return b; }
    static void WriteC(BinaryWriter bw, string t, byte[] d) {
        bw.Write(BE((uint)d.Length));
        byte[] tb = System.Text.Encoding.ASCII.GetBytes(t);
        bw.Write(tb);
        if (d.Length > 0) bw.Write(d);
        byte[] ci = new byte[4 + d.Length];
        Buffer.BlockCopy(tb, 0, ci, 0, 4);
        Buffer.BlockCopy(d, 0, ci, 4, d.Length);
        uint cr = CRC(ci);
        byte[] cb = BitConverter.GetBytes(cr);
        Array.Reverse(cb);
        bw.Write(cb);
    }
    public static void Gen(string path, byte r, byte g, byte b, int sz) {
        MemoryStream ms = new MemoryStream();
        BinaryWriter bw = new BinaryWriter(ms);
        bw.Write(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });
        MemoryStream ih = new MemoryStream();
        BinaryWriter iw = new BinaryWriter(ih);
        iw.Write(BE((uint)sz)); iw.Write(BE((uint)sz));
        iw.Write((byte)8); iw.Write((byte)2); iw.Write((byte)0);
        iw.Write((byte)0); iw.Write((byte)0);
        WriteC(bw, "IHDR", ih.ToArray());
        MemoryStream raw = new MemoryStream();
        for (int y = 0; y < sz; y++) {
            raw.WriteByte(0);
            for (int x = 0; x < sz; x++) { raw.WriteByte(r); raw.WriteByte(g); raw.WriteByte(b); }
        }
        byte[] rb = raw.ToArray();
        MemoryStream def = new MemoryStream();
        DeflateStream df = new DeflateStream(def, CompressionMode.Compress, true);
        df.Write(rb, 0, rb.Length);
        df.Close();
        WriteC(bw, "IDAT", def.ToArray());
        WriteC(bw, "IEND", new byte[0]);
        bw.Flush();
        File.WriteAllBytes(path, ms.ToArray());
    }
}
'@

Add-Type -TypeDefinition $cs -ReferencedAssemblies "System.dll"

$outDir = Join-Path $PSScriptRoot "..\src\assets\icons"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

Write-Host "Generating TabBar icons (81x81)..."
[Png]::Gen((Join-Path $outDir "home.png"), 99, 102, 241, 81)
[Png]::Gen((Join-Path $outDir "home-active.png"), 99, 102, 241, 81)
[Png]::Gen((Join-Path $outDir "pet.png"), 148, 163, 184, 81)
[Png]::Gen((Join-Path $outDir "pet-active.png"), 99, 102, 241, 81)
[Png]::Gen((Join-Path $outDir "product.png"), 148, 163, 184, 81)
[Png]::Gen((Join-Path $outDir "product-active.png"), 99, 102, 241, 81)
[Png]::Gen((Join-Path $outDir "notification.png"), 148, 163, 184, 81)
[Png]::Gen((Join-Path $outDir "notification-active.png"), 99, 102, 241, 81)
[Png]::Gen((Join-Path $outDir "profile.png"), 148, 163, 184, 81)
[Png]::Gen((Join-Path $outDir "profile-active.png"), 99, 102, 241, 81)
Write-Host "Done! 10 icons generated."
