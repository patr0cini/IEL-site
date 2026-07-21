import PDFKit
import AppKit

let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
var saida = ""
for i in 0..<doc.pageCount {
    guard let attr = doc.page(at: i)?.attributedString else { continue }
    attr.enumerateAttribute(.font, in: NSRange(location: 0, length: attr.length)) { valor, intervalo, _ in
        guard let f = valor as? NSFont else { return }
        // preserva o texto exato (espaços incluídos); escapa separadores
        let texto = (attr.string as NSString).substring(with: intervalo)
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\n", with: "\\n")
            .replacingOccurrences(of: "\t", with: "\\t")
        let chave = "\(f.fontName)|\(String(format: "%.1f", f.pointSize))"
        saida += chave + "\t" + texto + "\n"
    }
}
try! saida.write(toFile: CommandLine.arguments[2], atomically: true, encoding: .utf8)
