import Cocoa


protocol ReceiverViewDelegate : AnyObject {
    func didCast (_ receiver: Receiver)
}

class ReceiverView : NSStackView {
    weak var receiverViewDelegate: ReceiverViewDelegate?

    var receiver: Receiver!
    var constraintsSet = false

    var castButton: NSButton!
    var castingSpinner: NSProgressIndicator!


    var isEnabled: Bool {
        get {
            return self.castButton.isEnabled
        }
        set {
            self.castButton.isEnabled = newValue
        }
    }


    override init (frame: CGRect) {
        super.init(frame: frame)
    }
    required init? (coder: NSCoder) {
        super.init(coder: coder)
    }

    init (receiver: Receiver, initData: InitData) {
        super.init(frame: NSZeroRect)

        self.receiver = receiver

        let metaStackView = NSStackView(views: [
            makeLabel(receiver.friendlyName, size: 14)
          , makeLabel("\(receiver.host):\(receiver.port)"
                  , size: NSFont.smallSystemFontSize
                  , color: .secondaryLabelColor)
        ])

        metaStackView.alignment = .leading
        metaStackView.orientation = .vertical
        metaStackView.spacing = 4


        self.castButton = NSButton(
                title: initData.i18n_castButtonTitle
              , target: self
              , action: #selector(ReceiverView.onCast))

        self.castButton.bezelStyle = .rounded
        self.castButton.widthAnchor.constraint(equalToConstant: 100).isActive = true


        self.castingSpinner = NSProgressIndicator()
        self.castingSpinner.style = .spinning
        self.castingSpinner.controlSize = .small
        self.castingSpinner.isHidden = true

        self.addArrangedSubview(metaStackView)
        self.addArrangedSubview(self.castingSpinner)
        self.addArrangedSubview(self.castButton)

        self.distribution = .fill
    }

    override func updateConstraints () {
        super.updateConstraints()

        if !constraintsSet {
            self.translatesAutoresizingMaskIntoConstraints = false

            self.leadingAnchor.constraint(
                    equalTo: superview!.leadingAnchor
                  , constant: 8).isActive = true
            self.trailingAnchor.constraint(
                    equalTo: superview!.trailingAnchor
                  , constant: -8).isActive = true

            constraintsSet = true
        }
    }


    @objc
    func onCast () {
        self.receiverViewDelegate?.didCast(self.receiver)

        self.castingSpinner.isHidden = false
        self.castingSpinner.startAnimation(nil)
    }
}
